import { IUserRepository } from './user-repository.interface';
import { IUserService } from './user-service.interface';
import { UserCreateDto } from './user.dto';
import { User } from './user.model';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}
  async create(dto: UserCreateDto): Promise<User> {
    const user = User.create(dto);

    await this.userRepository.save(user);

    return user;
  }
}
