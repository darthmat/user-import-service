import { User } from './user.model';

export abstract class IUserRepository {
  abstract save(user: User): Promise<void>;
}
