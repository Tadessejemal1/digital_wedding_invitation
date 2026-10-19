import QRCode from "qrcode";

const DEFAULT_ORIGIN = "https://www.entro-wedding.com";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 280,
    margin: 3,
    errorCorrectionLevel: "H",
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

function siteOrigin(origin?: string): string {
  const raw =
    origin ||
    (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ||
    DEFAULT_ORIGIN;
  return raw.replace(/\/$/, "");
}

/**
 * Entrance QR payload — a check-in URL so both work:
 * - Phone camera app opens the link → /admin/checkin shows result
 * - Admin scanner camera reads the same QR and checks in on-page
 */
export function getGuestQrPayload(guestId: string, qrCode: string, origin?: string): string {
  const params = new URLSearchParams({ qr: qrCode });
  if (guestId) params.set("g", guestId);
  return `${siteOrigin(origin)}/admin/checkin?${params.toString()}`;
}

/** Parse camera/manual input: check-in URL, legacy JSON, or plain code. */
export function parseQrPayload(raw: string): { qrCode: string; guestId?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { qrCode: "" };

  try {
    const parsed = JSON.parse(trimmed) as { qrCode?: string; guestId?: string };
    if (parsed && (parsed.qrCode || parsed.guestId)) {
      return {
        qrCode: String(parsed.qrCode || "").trim(),
        guestId: parsed.guestId ? String(parsed.guestId).trim() : undefined,
      };
    }
  } catch {
    // not JSON
  }

  try {
    const url = new URL(trimmed);
    const qr = url.searchParams.get("qr") || url.searchParams.get("code") || "";
    const guestId = url.searchParams.get("g") || url.searchParams.get("guestId") || undefined;
    if (qr || guestId) {
      return {
        qrCode: qr.trim(),
        guestId: guestId ? guestId.trim() : undefined,
      };
    }
    // Path like /EDENAND12R-01
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    if (/^EDENAND12R-\d+$/i.test(last) || /^[A-Z0-9-]{6,}$/i.test(last)) {
      return { qrCode: last.trim() };
    }
  } catch {
    // not a URL
  }

  // Bare query string pasted without origin
  if (trimmed.includes("qr=") || trimmed.startsWith("?")) {
    const params = new URLSearchParams(trimmed.replace(/^\?/, ""));
    const qr = params.get("qr") || params.get("code") || "";
    const guestId = params.get("g") || params.get("guestId") || undefined;
    if (qr || guestId) {
      return {
        qrCode: qr.trim(),
        guestId: guestId ? guestId.trim() : undefined,
      };
    }
  }

  return { qrCode: trimmed };
}
