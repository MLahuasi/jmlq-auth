import {
  IGenerateAccessTokenProps,
  IGenerateRefreshTokenProps,
} from "../../props";
import { IJWTPayload } from "../jwt/payload";

export interface ITokenServicePort {
  generateAccessToken(props: IGenerateAccessTokenProps): Promise<string>;
  generateRefreshToken(props: IGenerateRefreshTokenProps): Promise<string>;
  verifyAccessToken(token: string): Promise<IJWTPayload>;
  verifyRefreshToken(token: string): Promise<IJWTPayload>;
  getTokenExpiration(token: string): Promise<Date>;
}
