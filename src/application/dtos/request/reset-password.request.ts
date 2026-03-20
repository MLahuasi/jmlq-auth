/**
 * Actualizar password usando un token una vez que se envía link a email
 */
export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;

  /**
   * Política de sesiones post-reset:
   * - true: logout global (recomendado)
   * - false: mantener sesiones (si lo permites)
   */
  logoutAllDevices?: boolean;
}
