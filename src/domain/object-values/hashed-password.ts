import { InvalidHashedPasswordError } from "../errors";

/**
 * Value object representing a hashed password.
 */
export class HashedPassword {
  /**
   * Guarda el valor hasheado de la contraseña
   */
  private readonly value: string;

  /**
   * Constructor
   * @param hashedValue
   */
  constructor(hash: string) {
    if (hash == null)
      throw new InvalidHashedPasswordError(
        "Hashed password cannot be null or undefined",
      );
    const v = String(hash).trim();
    if (v.length === 0)
      throw new InvalidHashedPasswordError("Hashed password cannot be empty");

    if (!/^\$(2[aby])\$(\d{2})\$[./A-Za-z0-9]{53}$/.test(v)) {
      /*
          | Parte               | Qué busca              | Significado                              |
          | ------------------- | ---------------------- | ---------------------------------------- |
          | `^`                 | Inicio de la cadena    | Asegura que no haya nada antes           |
          | `\$`                | Un símbolo `$` literal | Bcrypt separa secciones con `$`          |
          | `(2[aby])`          | "2a", "2b" o "2y"      | Versión del algoritmo bcrypt             |
          | `\$`                | Otro `$` literal       | Separador                                |
          | `(\d{2})`           | Dos dígitos            | Cost factor (número de rondas, ej. `10`) |
          | `\$`                | Otro `$`               | Separador                                |
          | `[./A-Za-z0-9]{53}` | 53 caracteres válidos  | El *hash + salt* en codificación bcrypt  |
          | `$`                 | Fin de la cadena       | Garantiza que no haya texto adicional    |


          $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
          │││ ││ └─ Hash y salt (53 chars)
          │││ └┴─ Cost factor (12)
          ││└─ Separador
          │└─ Versión (2a)
          └─ Separador inicial
       */
      throw new InvalidHashedPasswordError("Invalid bcrypt hash format");
    }

    // Validar el cost factor
    const cost = Number(v.split("$")[2]);
    // El cost factor debe estar entre 4 y 31
    if (cost < 4 || cost > 31)
      throw new InvalidHashedPasswordError("Invalid bcrypt cost factor");
    // Asignar valor si todo es correcto
    this.value = v;
  }

  /**
   * Igualdad por valor (hash vs hash)
   * @param other otro HashedPassword
   * @returns boolean indicando si son iguales
   */
  public equals(other: HashedPassword): boolean {
    return this.value === other.value;
  }

  /**
   * Solo para persistencia (repos). Evita usar en logs
   * @returns string hasheado
   */
  public serialize(): string {
    return this.value;
  }

  /** Blindajes contra exposición accidental */
  public toString(): string {
    return "[PROTECTED]";
  }
  public toJSON(): string {
    return "[PROTECTED]";
  }
}
