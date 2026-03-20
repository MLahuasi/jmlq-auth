export interface LoginResponse {
  sessionId: string;
  accessToken: string;
  refreshToken?: string;
}
