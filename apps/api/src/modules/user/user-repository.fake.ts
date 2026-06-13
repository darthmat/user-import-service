import { UserRepositoryPort } from './user-repository.port';
import { User } from './user.model';

export class FakeUserRepository implements UserRepositoryPort {
  private readonly users = new Map<string, User>();
  async save(user: User): Promise<boolean> {
    const isDuplicate = [...this.users.values()].some(
      (u) => u.email === user.email || u.username === user.username,
    );

    if (isDuplicate) {
      return false;
    }

    this.users.set(user.id, user);
    return true;
  }

  async saveMany(users: User[]): Promise<{ savedIds: Set<string> }> {
    const savedIds = new Set<string>();

    for (const user of users) {
      const isDuplicate = [...this.users.values()].some(
        (u) => u.email === user.email || u.username === user.username,
      );

      if (!isDuplicate) {
        this.users.set(user.id, user);
        savedIds.add(user.id);
      }
    }

    return { savedIds };
  }

  size(): number {
    return this.users.size;
  }
}
