import { getClientIp } from "./get-client-ip";

const VISITOR_ID_HEADER = "X-Likes-Visitor-Id";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_VISITOR_ID_LENGTH = 64;

export function isValidLikesVisitorId(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.length > MAX_VISITOR_ID_LENGTH) return false;
  return UUID_REGEX.test(value.trim());
}

/** Prefer visitor ID from header (if valid UUID), fallback to IP. Returns null if neither is available. */
export function getVisitorIdentifier(request: Request): string | null {
  const raw = request.headers.get(VISITOR_ID_HEADER)?.trim();
  if (raw && isValidLikesVisitorId(raw)) return raw;
  return getClientIp(request);
}
