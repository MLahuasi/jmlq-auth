import { InvalidJwtPayloadError } from "../errors";
import type { IJWTPayload } from "../ports";
import {
  optionalAudience,
  optionalRecord,
  optionalRoles,
  readNonEmptyString,
  requireFiniteNumber,
  requireNonEmptyString,
} from "./helpers";

/**
 * Domain Service
 * --------------
 * Normaliza y valida un payload JWT según las reglas del dominio.
 *
 * - Entrada: unknown (claims verificados por infraestructura/plugin)
 * - Salida: IJWTPayload tipado y confiable
 *
 * Importante:
 * - NO verifica firma
 * - NO parsea JWT
 * - Define únicamente reglas de dominio
 *
 * Contrato:
 * - `aud` se valida exclusivamente aquí vía `optionalAudience()`.
 * - Cualquier error de `aud` debe provenir de `InvalidJwtPayloadError`.
 */
export function normalizeJwtPayload(input: unknown): IJWTPayload {
  if (input == null || typeof input !== "object") {
    throw new InvalidJwtPayloadError("JWT payload must be an object", {
      receivedType: typeof input,
    });
  }

  const obj = input as Record<string, unknown>;

  // Required
  const sub = requireNonEmptyString(obj.sub, "sub");
  const sid = requireNonEmptyString(obj.sid, "sid");
  const jti = requireNonEmptyString(obj.jti, "jti");

  const iat = requireFiniteNumber(obj.iat, "iat");
  const exp = requireFiniteNumber(obj.exp, "exp");

  // Optional
  const iss = readNonEmptyString(obj.iss);
  /**
   * Canonical audience rule (core):
   * - string | string[] | undefined
   * - empty string or empty array => InvalidJwtPayloadError
   * - array => dedupe + sort
   */
  const aud = optionalAudience(obj.aud);
  const roles = optionalRoles(obj.roles);
  const customClaims = optionalRecord(obj.customClaims, "customClaims");

  return {
    sub,
    sid,
    jti,
    iat,
    exp,
    ...(iss ? { iss } : {}),
    ...(aud ? { aud } : {}),
    ...(roles ? { roles } : {}),
    ...(customClaims ? { customClaims } : {}),
  };
}
