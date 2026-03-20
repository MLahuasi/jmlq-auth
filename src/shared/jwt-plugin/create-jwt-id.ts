/**
 * Obtiene el tiempo actual en segundos Unix.
 *
 * @returns Timestamp Unix (segundos).
 */
function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Genera un identificador único para el claim `jti`.
 * - Usa crypto.randomUUID cuando está disponible.
 * - Fallback no-crypto para entornos legacy/dev.
 */
export function createJwtId(): string {
  if (hasCryptoRandomUUID(globalThis)) {
    return globalThis.crypto.randomUUID();
  }

  return `jti_${nowUnixSeconds()}_${Math.random().toString(16).slice(2)}`;
}

function hasCryptoRandomUUID(
  value: unknown,
): value is { crypto: { randomUUID: () => string } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "crypto" in value &&
    typeof (value as { crypto?: unknown }).crypto === "object" &&
    typeof (value as { crypto: { randomUUID?: unknown } }).crypto
      ?.randomUUID === "function"
  );
}
