/**
 * Normaliza clockSkewSeconds (en segundos).
 *
 * Responsabilidad única:
 * - Aceptar únicamente números válidos
 * - Convertir a entero (floor)
 * - Asegurar >= 0
 *
 * Reglas:
 * - no number / NaN => undefined
 * - < 0 => 0
 * - >== 0 => floor(value)
 */
export function normalizeClockSkewSeconds(
  value: number | undefined,
): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  if (value < 0) return 0;
  return Math.floor(value);
}
