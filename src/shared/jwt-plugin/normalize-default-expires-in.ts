/**
 * Normaliza defaults de expiración usados por plugins JWT.
 *
 * Responsabilidad única:
 * - Aceptar un shape compatible con { accessToken?, refreshToken? }
 * - Trim de strings
 * - Vacío => omitido
 * - Si queda vacío => undefined
 *
 * Importante:
 * - No depende de types de plugins para evitar acoplamiento.
 */
export function normalizeDefaultExpiresIn<
  T extends { accessToken?: string; refreshToken?: string },
>(value: T | undefined): T | undefined {
  if (!value) return undefined;

  const out = {} as T;

  const accessToken = normalizeOptionalNonEmptyString(value.accessToken);
  if (accessToken) out.accessToken = accessToken;

  const refreshToken = normalizeOptionalNonEmptyString(value.refreshToken);
  if (refreshToken) out.refreshToken = refreshToken;

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Helper local (mínimo) para evitar dependencia circular en exports del core.
 */
function normalizeOptionalNonEmptyString(
  value: string | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}
