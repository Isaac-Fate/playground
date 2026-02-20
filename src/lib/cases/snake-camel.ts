/** Converts a snake_case string to camelCase. e.g. "my_key" -> "myKey" */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Converts a camelCase string to snake_case. e.g. "myKey" -> "my_key" */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/**
 * Recursively converts all keys of an object (including nested objects and arrays)
 * using the provided key transformation function.
 * Primitives, null, undefined, and Date instances are returned as-is.
 */
function convertKeys<T>(obj: T, keyFn: (key: string) => string): T {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, keyFn)) as T;
  }

  if (obj instanceof Date) {
    return obj;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      keyFn(key),
      convertKeys(value, keyFn),
    ]),
  ) as T;
}

/** Recursively converts all keys of an object from snake_case to camelCase. */
export function convertKeysToCamelCase<T>(obj: T): T {
  return convertKeys(obj, toCamelCase);
}

/** Recursively converts all keys of an object from camelCase to snake_case. */
export function convertKeysToSnakeCase<T>(obj: T): T {
  return convertKeys(obj, toSnakeCase);
}
