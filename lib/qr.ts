import QRCode from "qrcode";

export async function generateQR(text: string) {
  return await QRCode.toDataURL(text);
}