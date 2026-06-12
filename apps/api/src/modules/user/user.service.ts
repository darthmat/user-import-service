import { ConflictException } from '@/utils/errors';
import { UserRepositoryPort } from './user-repository.port';
import { UserServicePort } from './user-service.port';
import { UserCreateDto } from './user.dto';
import { User } from './user.model';

export class UserService implements UserServicePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}
  async create(dto: UserCreateDto): Promise<User> {
    const user = User.create(dto);

    const isSaved = await this.userRepository.save(user);

    if (!isSaved) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    return user;
  }
}
