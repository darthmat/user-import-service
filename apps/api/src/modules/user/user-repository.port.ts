import { User } from './user.model';

export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<boolean>;
  abstract saveMany(users: User[]): Promise<{ savedIds: Set<string> }>;
}
