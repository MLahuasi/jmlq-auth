/**
 * Lee `customClaims` desde unknown.
 *
 * Responsabilidad única:
 * - Aceptar únicamente un objeto plano serializable (Record<string, unknown>)
 *
 * Reglas:
 * - undefined/null => undefined
 * - arrays => undefined
 * - objetos => Record<string, unknown>
 */
export function readCustomClaims(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return undefined;

  return value as Record<string, unknown>;
}
