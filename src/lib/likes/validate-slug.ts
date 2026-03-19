const SLUG_REGEX = /^[a-zA-Z0-9_-]{1,200}$/;

export function isValidSlug(slug: string): boolean {
  return typeof slug === "string" && SLUG_REGEX.test(slug);
}
