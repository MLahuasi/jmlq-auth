import { AuthFacade } from "./auth.facade";
import type {
  IUserRepositoryPort,
  ICredentialRepositoryPort,
  ITokenServicePort,
  IPasswordResetTokenPort,
  IEmailVerificationTokenPort,
} from "../../domain";
import type { AuthServiceFactoryOptions } from "../types";
import { AuthServiceFactory } from "../factories";

/**
 * Helper de integración para hosts (APIs externas).
 *
 * Crea el container oficial del core (@jmlq/auth) y lo envuelve con una facade
 * ergonómica (`AuthFacade`) para evitar boilerplate repetido.
 *
 * SRP:
 * - Este helper SOLO hace composición (wiring).
 * - No contiene reglas de negocio.
 */

export type CreateAuthFacadeDeps = Readonly<{
  userRepository: IUserRepositoryPort;
  credentialRepository: ICredentialRepositoryPort;
  tokenService: ITokenServicePort;
  passwordResetToken: IPasswordResetTokenPort;
  emailVerificationToken: IEmailVerificationTokenPort;
  options?: AuthServiceFactoryOptions;
}>;

export function createAuthFacade(deps: CreateAuthFacadeDeps): AuthFacade {
  const container = AuthServiceFactory.create(
    deps.userRepository,
    deps.credentialRepository,
    deps.tokenService,
    deps.passwordResetToken,
    deps.emailVerificationToken,
    deps.options,
  );

  return new AuthFacade(container);
}
