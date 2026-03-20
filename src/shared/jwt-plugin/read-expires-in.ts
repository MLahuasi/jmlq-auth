/**
 * Lee `expiresIn` desde unknown.
 *
 * Responsabilidad única:
 * - Normalizar un valor desconocido a `string | undefined`
 *
 * Reglas:
 * - no string => undefined
 * - string vacío => undefined
 * - string con espacios => trim()
 */
export function readExpiresIn(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
