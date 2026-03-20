import { InvalidEmailError } from "../errors";

/**
 *Value Object del dominio: una forma segura y
 *validada de manejar correos electrónicos dentro del sistema.
 */
export class Email {
  /**
   * Guarda el correo en formato estandarizado
   */
  private readonly value: string;

  /**
   * Crea una nueva instancia de Email
   * @param email
   */
  constructor(email: string) {
    // Limpia espacios innecesarios.
    const trimmedEmail = email.trim();
    if (!this.isValid(trimmedEmail)) {
      throw new InvalidEmailError(email);
    }
    this.value = trimmedEmail.toLowerCase();
  }
  /**
   * Verifica que el formato sea válido
   * @param email El correo a validar
   * @returns true si es válido, false si no lo es
   */
  private isValid(email: string): boolean {
    // validación básica de formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // También limita la longitud a 254 caracteres
    return emailRegex.test(email) && email.length <= 254;
  }
  /**
   * Devuelve el string del correo
   * @return El correo electrónico
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara si dos objetos Email representan el mismo correo
   * @param other El otro objeto Email a comparar
   * @return true si son iguales, false si no lo son
   */
  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Convierte el objeto Email a string
   * @return El correo electrónico en formato string
   */
  public toString(): string {
    return this.value;
  }
}
