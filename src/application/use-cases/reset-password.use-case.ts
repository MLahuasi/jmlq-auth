import type {
  ICredentialRepositoryPort,
  IPasswordHasherPort,
  IPasswordPolicyPort,
  IUserRepositoryPort,
} from "../../domain/ports";
import { HashedPassword } from "../../domain/object-values";
import type { IPasswordResetTokenPort } from "../../domain/ports/auth/password-reset-token.port";
import { UserNotFoundError } from "../../domain/errors";
import {
  PasswordResetTokenExpiredError,
  PasswordResetTokenInvalidError,
} from "../../domain/errors/password-reset.errors";
import { ResetPasswordRequest, ResetPasswordResponse } from "../dtos";
import { assertPasswordPolicy, assertPasswordsMatch } from "./internal";

/**
 * Confirma el reseteo de contraseña usando token (single-use).
 *
 * - Verifica y consume token
 * - Aplica policy
 * - Cambia hash del usuario
 * - Revoca sesiones según política (por defecto: logout global recomendado)
 */
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly credentialRepository: ICredentialRepositoryPort,
    private readonly passwordHasher: IPasswordHasherPort,
    private readonly passwordPolicy: IPasswordPolicyPort,
    private readonly passwordResetToken: IPasswordResetTokenPort,
  ) {}

  public async execute(
    request: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    // Validación de request (application)
    assertPasswordsMatch(request.newPassword, request.confirmNewPassword);
    assertPasswordPolicy(this.passwordPolicy, request.newPassword);

    // Consumir token (single-use). La implementación debe asegurar atomicidad.
    const consumed = await this.passwordResetToken
      .consume(request.resetToken)
      .catch((e) => {
        // Mantener errores estables: no filtrar detalles del storage
        // Nota: si quieres distinguir invalid vs used, puedes mapear en el adapter.
        throw new PasswordResetTokenInvalidError(
          e instanceof Error ? e.message : "Password reset token is invalid",
        );
      });

    // Verificar expiración por seguridad adicional (aunque el adapter debería hacerlo)
    if (new Date() > consumed.expiresAt) {
      throw new PasswordResetTokenExpiredError();
    }

    const userId = consumed.userId;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      // No debería pasar si token fue emitido correctamente, pero es seguro.
      throw new UserNotFoundError("User not found");
    }

    // Hash + cambio de password en el agregado
    const newHash = await this.passwordHasher.hash(request.newPassword);
    user.changePassword(new HashedPassword(newHash));
    await this.userRepository.update(user);

    // Política de sesiones:
    // - default: logout global (recomendación de seguridad)
    const logoutAll = request.logoutAllDevices ?? true;

    if (logoutAll) {
      await this.credentialRepository.deleteByUserId(userId);
    }

    return { success: true, message: "Password has been reset successfully" };
  }
}
