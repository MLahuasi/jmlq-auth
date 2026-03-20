import { UserRole } from "../types";

export interface RegisterUserRequest {
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
}
