export {
  optionalAudience,
  assertJwtStructure,
} from "./domain/services/helpers";

export type { IAuthServiceContainer } from "./infrastructure/types";

export { AuthServiceFactoryOptions } from "./application/types";

/**
 * Contrato público (JWT payload):
 * - Los plugins devuelven payload verificado criptográficamente como unknown.
 * - El core normaliza/valida y expone API estable para consumo externo.
 */
export { normalizeJwtPayload } from "./domain/services";

/**
 * Export explícito (contractual):
 * Aunque ya se exporta vía `export * from "./domain/errors"`,
 * se expone de forma directa para que el host/plugins lo consuman sin ambigüedad.
 */
export * from "./domain/errors";

// Contratos (ports) + config
export * from "./domain/ports";

// Entities
export * from "./domain/entities";

// Helpers
export { readNonEmptyString } from "./domain/services/helpers";

// VOs
export * from "./domain/object-values";

// Props (JWT generation inputs, etc.)
export * from "./domain/props";

// Errores públicos
export * from "./domain/errors";

// DTOs (solo types)
export * from "./application/dtos";

// Facades (entrypoint recomendado para hosts)
export * from "./application/facades";

export * from "./shared";
