import type {
  ICredentialRepositoryPort,
  IPasswordHasherPort,
  IPasswordPolicyPort,
  IUserRepositoryPort,
} from "../../domain/ports";
import { HashedPassword, Id } from "../../domain/object-values";
import { PasswordMismatchError, UserNotFoundError } from "../../domain/errors";
import { ChangePasswordRequest, ChangePasswordResponse } from "../dtos";
import { assertPasswordPolicy, assertPasswordsMatch } from "./internal";

/**
 * Cambia contraseña con validación de password actual.
 *
 * - Valida confirmación
 * - Valida policy
 * - Verifica password actual
 * - Cambia hash
 * - Revoca sesiones:
 *   - logoutAllDevices=true => revoca todas
 *   - false => revoca solo la sesión actual (sessionId)
 */
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly credentialRepository: ICredentialRepositoryPort,
    private readonly passwordHasher: IPasswordHasherPort,
    private readonly passwordPolicy: IPasswordPolicyPort,
  ) {}

  public async execute(
    request: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    assertPasswordsMatch(request.newPassword, request.confirmNewPassword);
    assertPasswordPolicy(this.passwordPolicy, request.newPassword);

    const user = await this.userRepository.findById(new Id(request.userId));
    if (!user) throw new UserNotFoundError("User not found");

    const currentHash = user.password.serialize();
    const ok = await this.passwordHasher.compare(
      request.currentPassword,
      currentHash,
    );

    if (!ok) {
      throw new PasswordMismatchError("Current password is invalid");
    }

    const newHash = await this.passwordHasher.hash(request.newPassword);
    user.changePassword(new HashedPassword(newHash));
    await this.userRepository.update(user);

    const userId = user.id;

    if (request.logoutAllDevices) {
      await this.credentialRepository.deleteByUserId(userId);
    } else {
      await this.credentialRepository.deleteBySessionId(
        new Id(request.sessionId),
      );
    }

    return { success: true, message: "Password changed successfully" };
  }
}
