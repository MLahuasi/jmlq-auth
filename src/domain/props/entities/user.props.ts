import { Email, HashedPassword, Id, Role } from "../../object-values";

export interface IUserProps {
  id: Id;
  email: Email;
  roles: Role[];
  password: HashedPassword;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
