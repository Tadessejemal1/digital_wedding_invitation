import QRCode from "qrcode";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: "#2D2D2D", light: "#FFFDF8" },
  });
}

export function getGuestQrPayload(guestId: string, qrCode: string): string {
  return JSON.stringify({ guestId, qrCode, type: "wedding-checkin" });
}
