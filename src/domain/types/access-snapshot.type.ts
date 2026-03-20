/**
 * Snapshot de acceso “en este instante”.
 *
 * “Snapshot” porque representa una fotografía de roles/permisos efectivos
 * en un momento dado (por ejemplo: al momento de emitir el token o responder /me).
 *
 * Importante:
 * - No implica que sea la "fuente de verdad" para siempre.
 * - La fuente de verdad real es la BDD (y se revalida por middleware en el host).
 */
export type AccessSnapshot = Readonly<{
  userId: string;
  roles: readonly string[];
  permissions: readonly string[];
}>;
