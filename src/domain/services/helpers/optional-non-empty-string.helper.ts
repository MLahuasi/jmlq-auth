export function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}
