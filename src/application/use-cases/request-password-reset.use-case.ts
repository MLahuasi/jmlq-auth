import type { IUserRepositoryPort } from "../../domain/ports";
import { Email } from "../../domain/object-values";
import type { IPasswordResetTokenPort } from "../../domain/ports/auth/password-reset-token.port";
import {
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
} from "../dtos";
import { TimeParser } from "../../shared/utils/time-parser";

/**
 * Solicita reset de contraseña.
 *
 * - Anti-enumeración: siempre retorna el mismo mensaje de éxito.
 * - Si el usuario existe, retorna `delivery` para que el API envíe el email.
 * - NO envía emails (el API lo hace con @jmlq/mailer).
 */
export class RequestPasswordResetUseCase {
  private readonly resetTokenTtl: string;

  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly passwordResetToken: IPasswordResetTokenPort,
    opts?: { resetTokenTtl?: string },
  ) {
    // Default conservador: 15 minutos
    this.resetTokenTtl = opts?.resetTokenTtl ?? "15m";
  }

  public async execute(
    request: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> {
    const message =
      "A link to reset your password has been sent to your email address.";

    // Normaliza y valida el email vía VO
    const email = new Email(request.email);

    // Buscar usuario (no revelar resultado al cliente final)
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return { success: true, message };
    }

    // Emite token con TTL (reutiliza utility existente)
    const ttlMs = TimeParser.parseToMilliseconds(this.resetTokenTtl);

    const issued = await this.passwordResetToken.issue(user.id, ttlMs);

    return {
      success: true,
      message,
      delivery: {
        email: user.email.getValue(),
        resetToken: issued.token,
        expiresAt: issued.expiresAt.toISOString(),
      },
    };
  }
}
