import { DefaultPasswordPolicy } from "../../domain/services";
import {
  ICredentialRepositoryPort,
  ITokenServicePort,
  IUserRepositoryPort,
  IPasswordResetTokenPort,
  IEmailVerificationTokenPort,
} from "../../domain";

import {
  ChangePasswordUseCase,
  LoginWithPasswordUseCase,
  LogoutUseCase,
  MeUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  VerifyEmailUseCase,
} from "../use-cases";
import type { IAuthServiceContainer } from "../../infrastructure/types";
import { BcryptPasswordHasher } from "../../infrastructure/security";
import { TokenSessionService } from "../../infrastructure/services";
import type { AuthServiceFactoryOptions } from "../types";

/**
 * Factory principal:
 * - construye servicios e inyecta dependencias
 * - encapsula configuración para que NO se repita en cada API externa
 */
export class AuthServiceFactory {
  public static create(
    userRepository: IUserRepositoryPort,
    credentialRepository: ICredentialRepositoryPort,
    tokenService: ITokenServicePort,
    passwordResetToken: IPasswordResetTokenPort,
    emailVerificationToken: IEmailVerificationTokenPort,
    options?: AuthServiceFactoryOptions,
  ): IAuthServiceContainer {
    // 1) Policy + hasher
    const passwordPolicy =
      options?.passwordPolicy ?? new DefaultPasswordPolicy();
    const passwordHasher = new BcryptPasswordHasher(options?.bcryptSaltRounds);

    // 2) Session service (rotación/revocación)
    const tokenSession = new TokenSessionService(
      tokenService,
      userRepository,
      credentialRepository,
      options?.accessTokenTtl ?? "15m",
      options?.refreshTokenTtl ?? "7d",
    );

    // 3) Use cases
    const registerUserUseCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      passwordPolicy,
      emailVerificationToken,
      { verifyTokenTtl: options?.emailVerificationTokenTtl },
    );

    const verifyEmailUseCase = new VerifyEmailUseCase(
      userRepository,
      emailVerificationToken,
    );

    const loginWithPasswordUseCase = new LoginWithPasswordUseCase(
      userRepository,
      passwordHasher,
      tokenSession,
    );

    const meUseCase = new MeUseCase(userRepository);

    const refreshTokenUseCase = new RefreshTokenUseCase(tokenSession);
    const logoutUseCase = new LogoutUseCase(tokenSession);

    // 4) Use cases nuevos (password flows)
    const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
      userRepository,
      passwordResetToken,
      { resetTokenTtl: options?.passwordResetTokenTtl },
    );

    const resetPasswordUseCase = new ResetPasswordUseCase(
      userRepository,
      credentialRepository,
      passwordHasher,
      passwordPolicy,
      passwordResetToken,
    );

    const changePasswordUseCase = new ChangePasswordUseCase(
      userRepository,
      credentialRepository,
      passwordHasher,
      passwordPolicy,
    );

    return {
      userRepository,
      credentialRepository,
      passwordHasher,
      tokenService,
      passwordPolicy,
      tokenSession,
      passwordResetToken,
      registerUserUseCase,
      loginWithPasswordUseCase,
      refreshTokenUseCase,
      logoutUseCase,
      requestPasswordResetUseCase,
      resetPasswordUseCase,
      changePasswordUseCase,
      verifyEmailUseCase,
      emailVerificationToken,
      meUseCase,
    };
  }
}
