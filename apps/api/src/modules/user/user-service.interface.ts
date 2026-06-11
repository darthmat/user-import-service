import { UserCreateDto } from './user.dto';
import { User } from './user.model';

export abstract class IUserService {
  abstract create(dto: UserCreateDto): Promise<User>;
}
