import { Id } from "../object-values";
import { ICredentialProps } from "../props/entities";

/**
 * Representa las credenciales activas de un usuario dentro del dominio
 */
export class Credential {
  /**
   * Identificador del dispositivo en el que se conecto el usuario
   */
  private readonly _sessionId: Id;
  /**
   * Identificador del usuario asociado a las credenciales
   */
  private readonly _userId: Id;
  /**
   * Token de acceso asociado
   */
  private readonly _accessToken: string;
  /**
   * Token de refresco asociado
   */
  private readonly _refreshToken?: string;
  /**
   * Fecha de expiración del token de acceso
   */
  private readonly _expiresAt: Date;
  /**
   * Fecha de creación de las credenciales
   */
  private readonly _createdAt: Date;

  /**
   * Constructor privado para evitar instanciación directa
   * @param props Propiedades de las credenciales
   */
  constructor(props: ICredentialProps) {
    this._sessionId = props.sessionId;
    this._userId = props.userId;
    this._accessToken = props.accessToken;
    this._refreshToken = props.refreshToken;
    this._expiresAt = props.expiresAt;
    this._createdAt = props.createdAt;
  }

  // Getters
  /**
   * Obtiene el identificador del dispositivo en el que se conectó el usuario
   */
  public get sessionId(): Id {
    return this._sessionId;
  }

  /**
   * Obtiene el identificador del usuario asociado a las credenciales
   */
  public get userId(): Id {
    return this._userId;
  }
  /**
   * Obtiene el token de acceso
   */
  public get accessToken(): string {
    return this._accessToken;
  }
  /**
   * Obtiene el token de refresco
   */
  public get refreshToken(): string | undefined {
    return this._refreshToken;
  }
  /**
   * Obtiene la fecha de expiración del token de acceso
   */
  public get expiresAt(): Date {
    return new Date(this._expiresAt);
  }
  /**
   * Obtiene la fecha de creación de las credenciales
   */
  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  // Business methods
  /**
   * Evalúa si las credenciales han expirado
   * @returns Verdadero si las credenciales han expirado, falso en caso contrario
   */
  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * Crea una nueva instancia de Credential
   * @param userId Identificador del usuario
   * @param accessToken Token de acceso
   * @param refreshToken Token de refresco
   * @param expirationDate Fecha de expiración del token de acceso
   * @returns Nueva instancia de Credential
   */
  public static create(
    sessionId: Id,
    userId: Id,
    accessToken: string,
    refreshToken: string,
    expirationDate: Date,
  ): Credential {
    return new Credential({
      sessionId,
      userId,
      accessToken,
      refreshToken,
      expiresAt: expirationDate,
      createdAt: new Date(),
    });
  }
  /**
   *Reconstitution method for repository
   *refreshToken puede venir undefined si en DB solo existe hash.
   */
  public static reconstitute(props: ICredentialProps): Credential {
    return new Credential(props);
  }

  /**
   * Crea una nueva credencial como resultado de una rotación de refresh token.
   * Impone que refreshToken exista (rotación obligatoria).
   */
  public static rotate(props: {
    sessionId: Id;
    userId: Id;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt?: Date;
  }): Credential {
    return new Credential({
      sessionId: props.sessionId,
      userId: props.userId,
      accessToken: props.accessToken,
      refreshToken: props.refreshToken,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  /**
   * Devuelve el refresh token o lanza si no existe.
   *
   * Uso:
   * - Flujos donde el refresh token es OBLIGATORIO
   *   (login, refresh/rotación).
   *
   * Seguridad:
   * - Evita usar `!` o cast inseguros.
   * - Hace explícito el invariante del dominio.
   */
  public requireRefreshToken(): string {
    if (!this._refreshToken) {
      throw new Error(
        "Invariant violation: refreshToken is required but missing",
      );
    }
    return this._refreshToken;
  }
}
