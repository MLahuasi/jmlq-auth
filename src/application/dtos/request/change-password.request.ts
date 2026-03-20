/**
 * Cambiar password desde formulario
 */
export interface ChangePasswordRequest {
  userId: string;
  sessionId: string;

  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;

  /**
   * Si es true, revoca todas las sesiones del usuario.
   * Si es false, revoca solo la sesión actual (sessionId).
   */
  logoutAllDevices: boolean;
}
