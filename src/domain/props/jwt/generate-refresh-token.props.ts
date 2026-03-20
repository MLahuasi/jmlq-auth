import { JwtUser } from "./jwt-user";

export interface IGenerateRefreshTokenProps {
  user: JwtUser;
  sessionId: string;
  expiresIn?: string;
  customClaims?: Record<string, unknown>;
}
