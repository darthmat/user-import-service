import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UserCreateDto } from './user.dto';
import { IUserService } from './user-service.interface';

@Controller('users')
export class UserController {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,
  ) {}

  @Post()
  async create(@Body() dto: UserCreateDto) {
    const user = await this.userService.create(dto);
    return user;
  }
}
