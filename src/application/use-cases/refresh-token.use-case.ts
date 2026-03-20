import { ITokenSessionPort } from "../../domain/ports";
import { RefreshTokenRequest, RefreshTokenResponse } from "../dtos";
import { TokenExpiredError } from "../../domain/errors";

/**
 * RefreshTokenUseCase
 *
 * Responsabilidad única:
 * - Orquestar el refresh de sesión.
 *
 * Política de seguridad:
 * - Rotación obligatoria: cada refresh debe generar un refreshToken NUEVO.
 * - Si el tokenSession no retorna refreshToken nuevo, se considera inválido/expirado.
 *
 * Nota:
 * - Este caso de uso NO conoce cómo se persiste el refreshToken (claro vs hash).
 *   Esa responsabilidad vive en infraestructura (repositorios / tokenSession).
 */
export class RefreshTokenUseCase {
  constructor(private readonly tokenSession: ITokenSessionPort) {}

  public async execute(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    try {
      // Refrescar la sesión
      const credential = await this.tokenSession.refreshSession(
        request.refreshToken,
      );

      /**
       * Rotación obligatoria:
       * - Debe existir un refreshToken NUEVO en el credential retornado.
       * - Si no existe, es una violación de contrato interno (bug/config),
       *   y por seguridad se responde como token inválido/expirado.
       */
      const newRefreshToken = credential.refreshToken;
      if (typeof newRefreshToken !== "string" || !newRefreshToken.trim()) {
        // Mensaje genérico por seguridad
        throw new TokenExpiredError();
      }

      return {
        sessionId: credential.sessionId.getValue(),
        accessToken: credential.accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // Si quieres, aquí puedes mapear SOLO expiración e invalid-token a TokenExpiredError
      // y relanzar el resto. Mantengo tu comportamiento actual para no cambiar semántica.
      throw new TokenExpiredError();
    }
  }
}
