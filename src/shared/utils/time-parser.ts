export class TimeParser {
  private static readonly TIME_UNITS: Record<string, number> = {
    s: 1000, // segundos
    m: 60 * 1000, // minutos
    h: 60 * 60 * 1000, // horas
    d: 24 * 60 * 60 * 1000, // días
  };

  private static readonly TIME_PATTERN = /^(\d+)([smhd])$/;

  /**
   * Convierte una cadena de tiempo (ej: "15m", "1h", "7d") a milisegundos
   * @param timeString - Cadena de tiempo en formato número + unidad
   * @returns Tiempo en milisegundos
   * @throws Error si el formato es inválido
   */
  public static parseToMilliseconds(timeString: string): number {
    if (!timeString || typeof timeString !== "string") {
      throw new Error("Time string is required and must be a string");
    }

    const trimmed = timeString.trim().toLowerCase();
    const match = trimmed.match(this.TIME_PATTERN);

    if (!match) {
      throw new Error(
        `Invalid time format: "${timeString}". Expected format: number + unit (s, m, h, d). Examples: "15m", "1h", "7d"`,
      );
    }

    const [, valueStr, unit] = match;
    const value = parseInt(valueStr, 10);

    if (isNaN(value) || value <= 0) {
      throw new Error(
        `Invalid time value: "${valueStr}". Must be a positive number`,
      );
    }

    const multiplier = this.TIME_UNITS[unit];
    return value * multiplier;
  }

  /**
   * Valida si una cadena de tiempo tiene el formato correcto
   * @param timeString - Cadena de tiempo a validar
   * @returns true si es válida, false en caso contrario
   */
  public static isValidTimeString(timeString: string): boolean {
    try {
      this.parseToMilliseconds(timeString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene las unidades de tiempo soportadas
   * @returns Array con las unidades soportadas
   */
  public static getSupportedUnits(): string[] {
    return Object.keys(this.TIME_UNITS);
  }

  /**
   * Convierte milisegundos a formato legible
   * @param milliseconds - Tiempo en milisegundos
   * @returns Cadena de tiempo legible
   */
  public static formatMilliseconds(milliseconds: number): string {
    const units = [
      { unit: "d", value: 24 * 60 * 60 * 1000 },
      { unit: "h", value: 60 * 60 * 1000 },
      { unit: "m", value: 60 * 1000 },
      { unit: "s", value: 1000 },
    ];

    for (const { unit, value } of units) {
      if (milliseconds >= value && milliseconds % value === 0) {
        return `${milliseconds / value}${unit}`;
      }
    }

    return `${milliseconds}ms`;
  }
}
