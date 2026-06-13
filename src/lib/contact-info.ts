// Replace with the agency's real numbers.
export const WHATSAPP_NUMBER = "9779800000000"; // 977 + 10-digit mobile, no + or spaces
export const PHONE_NUMBER = "+97714000000";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
