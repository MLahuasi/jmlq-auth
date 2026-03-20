import { Email, Id, IUserRepositoryPort, User } from "../domain";

// Esta clase es una implementación en memoria del repositorio de usuarios que gestiona la persistencia de entidades User durante la ejecución de la aplicación.
// Función principal: Almacenar y gestionar usuarios en memoria, proporcionando operaciones CRUD completas para la entidad User.
export class InMemoryUserRepository implements IUserRepositoryPort {
  // almacena los usuarios indexados por su ID único
  private users: Map<string, User> = new Map();

  // Guarda un nuevo usuario en el repositorio
  public async save(user: User): Promise<void> {
    this.users.set(user.id.getValue(), user);
  }

  // Busca un usuario por su ID único
  public async findById(id: Id): Promise<User | null> {
    return this.users.get(id.getValue()) || null;
  }

  // Busca un usuario por su dirección de email
  public async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  // Actualiza un usuario existente
  public async update(user: User): Promise<void> {
    if (!this.users.has(user.id.getValue())) {
      throw new Error("User not found");
    }
    this.users.set(user.id.getValue(), user);
  }

  // Elimina un usuario por su ID
  public async delete(id: Id): Promise<void> {
    this.users.delete(id.getValue());
  }

  // Verifica si existe un usuario con el email dado
  public async exists(email: Email): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  // Método auxiliar para limpiar todos los datos
  public clear(): void {
    this.users.clear();
  }
}
