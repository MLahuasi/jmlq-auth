import { readNonEmptyString } from "../../domain/services/helpers";

/**
 * Lee y valida `sessionId`.
 *
 * Regla de dominio:
 * - sessionId es obligatorio para soporte multi-sesión
 *
 * NOTA:
 * - NO lanza Error genérico
 * - La decisión del error final se delega al core
 */
export function readSessionId(value: unknown): string | undefined {
  return readNonEmptyString(value);
}
