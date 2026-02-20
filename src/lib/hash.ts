import CryptoJS from "crypto-js";

export function hashContent(str: string): string {
  return CryptoJS.MD5(str).toString();
}
