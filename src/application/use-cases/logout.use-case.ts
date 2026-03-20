import { Id } from "../../domain/object-values";
import { LogoutError } from "../../domain/errors";
import { ITokenSessionPort } from "../../domain/ports";
import { LogoutRequest, LogoutResponse } from "../dtos";

export class LogoutUseCase {
  constructor(private readonly tokenSession: ITokenSessionPort) {}

  public async execute(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      // Regla: preferir sessionId (logout por dispositivo) si existe
      if (request.sessionId) {
        await this.tokenSession.revokeSessionById(new Id(request.sessionId));
      } else if (request.refreshToken) {
        // Compatibilidad: logout basado en refresh token
        await this.tokenSession.revokeSession(request.refreshToken);
      } else {
        // Evita "logout exitoso" sin parámetros
        throw new LogoutError("Missing sessionId or refreshToken");
      }

      return {
        success: true,
        message: "Successfully logged out",
      };
    } catch (error) {
      throw new LogoutError("Failed to logout", error);
    }
  }
}
