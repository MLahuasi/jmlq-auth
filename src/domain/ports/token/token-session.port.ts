import { Id } from "../../object-values";
import { Credential, User } from "../../entities";

export interface ITokenSessionPort {
  createSession(user: User): Promise<Credential>;
  refreshSession(refreshToken: string): Promise<Credential>;
  validateSession(accessToken: string): Promise<User | null>;
  revokeSession(refreshToken: string): Promise<void>;
  revokeSessionById(sessionId: Id): Promise<void>;
}
