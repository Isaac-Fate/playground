import CryptoJS from "crypto-js";

export function computeChecksum(text: string): string {
  return CryptoJS.MD5(text).toString();
}
