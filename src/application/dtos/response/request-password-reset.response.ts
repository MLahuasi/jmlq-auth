/**
 * Respuesta del caso de uso.
 * - `message` debe ser genérico para evitar enumeración de usuarios.
 * - `delivery` es opcional y SOLO debe usarse internamente por el API para enviar email.
 *   No se recomienda devolver `delivery` al cliente final.
 */
export interface RequestPasswordResetResponse {
  success: true;
  message: string;
  delivery?: {
    email: string;
    resetToken: string;
    expiresAt: string; // ISO string
  };
}
