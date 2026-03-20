export interface MeResponse {
  id: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: { role: string }[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
