import { uuidv7 } from 'uuidv7';
import { User } from '../user.model';

export function createFakeUser(overrides: Partial<User> = {}): User {
  return User.fromData({
    id: overrides.id ?? uuidv7(),
    username: overrides.username ?? 'JohnDoe',
    email: overrides.email ?? 'johndoe@example.com',
    createdAt: overrides.createdAt ?? new Date(),
  });
}
