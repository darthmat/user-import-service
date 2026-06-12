import { UserCreateDto } from './user.dto';
import { User } from './user.model';

export abstract class UserServicePort {
  abstract create(dto: UserCreateDto): Promise<User>;
}
