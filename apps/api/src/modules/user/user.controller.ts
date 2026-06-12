import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UserServicePort } from './user-service.port';
import { UserCreateDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UserServicePort) private readonly userService: UserServicePort,
  ) {}

  @Post()
  async create(@Body() dto: UserCreateDto) {
    const user = await this.userService.create(dto);
    return user;
  }
}
