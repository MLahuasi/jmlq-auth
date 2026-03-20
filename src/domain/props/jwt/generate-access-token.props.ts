import { JwtUser } from "./jwt-user";

export interface IGenerateAccessTokenProps {
  user: JwtUser;
  sessionId: string;
  expiresIn?: string;
  customClaims?: Record<string, unknown>;
}
