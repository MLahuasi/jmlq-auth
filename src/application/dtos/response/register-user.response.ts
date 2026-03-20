export interface RegisterUserResponse {
  id: string;
  roles: { role: string }[];
  isActive: boolean;

  /**
   * Delivery interno para el host (API) para enviar email.
   * NO recomendado devolver al cliente.
   */
  delivery?: {
    email: string;
    token: string;
    expiresAt: string; // ISO
  };
}
