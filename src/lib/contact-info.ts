// Single source of truth for agency contact info.
export const WHATSAPP_NUMBER = "9779856003662"; // 977 + 10-digit, no + or spaces
export const PHONE_NUMBER = "+9779856003662";
export const EMAIL = "info@woodappletours.com";
export const ADDRESS = "";
export const OFFICE_HOURS = "9:00 – 17:00";
export const NTB_LICENSE = "";
export const COMPANY_REG = "";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
