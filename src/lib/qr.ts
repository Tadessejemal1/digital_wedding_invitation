import QRCode from "qrcode";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 280,
    margin: 3,
    errorCorrectionLevel: "H",
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

export function getGuestQrPayload(guestId: string, qrCode: string): string {
  return JSON.stringify({ guestId, qrCode, type: "wedding-checkin" });
}
