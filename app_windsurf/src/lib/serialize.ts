/**
 * Recursively converts Prisma Decimal objects and Date objects to plain JS
 * primitives so the result can be safely passed from Server Components to
 * Client Components.
 *
 * - Decimal  → number
 * - Date     → ISO string
 * - Arrays   → recursively serialized
 * - Objects  → recursively serialized
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;

  // Prisma Decimal – check by constructor name (works across all Prisma versions)
  // Also handles decimal.js / @prisma/client Decimal
  const ctorName = (obj as object)?.constructor?.name;
  if (ctorName === "Decimal" || ctorName === "PrismaDecimal") {
    // Try toNumber() first, fall back to parseFloat(toString())
    if (typeof (obj as Record<string, unknown>).toNumber === "function") {
      return (obj as unknown as { toNumber(): number }).toNumber();
    }
    return parseFloat(String(obj));
  }

  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) return obj.map(serialize);

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as object)) {
      result[key] = serialize((obj as Record<string, unknown>)[key]);
    }
    return result;
  }

  return obj;
}
