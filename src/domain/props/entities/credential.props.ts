import { Id } from "../../object-values";

export interface ICredentialProps {
  sessionId: Id;
  userId: Id;
  accessToken: string;
  /**
   * Token de refresco (secreto).
   * Nota de seguridad:
   * - En persistencia NO debe guardarse en claro.
   * - En reconstitución desde DB puede ser undefined (solo existe el hash).
   * - En flujos que emiten tokens (login/refresh) debe existir.
   */
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
}
