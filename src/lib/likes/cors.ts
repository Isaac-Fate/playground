/**
 * Production domains and their subdomains. In production, only requests from
 * these origins receive CORS headers.
 */
const PRODUCTION_ALLOWED_DOMAINS = ["isaacfei.com", "isaac-fei.com"];

function isProductionAllowedDomain(hostname: string): boolean {
  return PRODUCTION_ALLOWED_DOMAINS.some(
    (domain) =>
      hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function isDevelopmentOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin || typeof origin !== "string") return false;
  try {
    const hostname = new URL(origin).hostname;

    if (isProductionAllowedDomain(hostname)) return true;
    if (process.env.NODE_ENV !== "production" && isDevelopmentOrigin(origin))
      return true;

    return false;
  } catch {
    return false;
  }
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers = { ...CORS_HEADERS };
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function withCorsHeaders(
  response: Response,
  origin: string | null
): Response {
  const corsHeaders = getCorsHeaders(origin);
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export function createCorsPreflightResponse(origin: string | null): Response {
  const corsHeaders = getCorsHeaders(origin);
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
