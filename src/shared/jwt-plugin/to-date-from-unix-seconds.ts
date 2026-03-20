/**
 * Convierte segundos Unix a Date.
 *
 * @param expSeconds `exp` en segundos Unix.
 * @returns Date correspondiente.
 */
export function toDateFromUnixSeconds(expSeconds: number): Date {
  return new Date(expSeconds * 1000);
}
