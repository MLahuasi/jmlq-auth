export interface JwtUser {
  /**
   * Identificador único del usuario (claim `sub`).
   */
  id: string;
  /**
   * Opcional: algunas apps pueden incluirlo, pero no es requerido por el core.
   */
  email?: string;
  /**
   * Opcional: JWT delgado (RBAC en BDD).
   */
  roles?: { role: string }[];
}
