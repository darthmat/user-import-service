import {
  DelimiterRequiredException,
  FileRequiredException,
} from '@/utils/errors';
import { MultipartValue } from '@fastify/multipart';
import { Body, Controller, Inject, Post, Request } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UserImportServicePort } from './user-import/user-import.port';
import { UserServicePort } from './user-service.port';
import { UserCreateDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UserServicePort)
    private readonly userService: UserServicePort,
    @Inject(UserImportServicePort)
    private readonly userImportService: UserImportServicePort,
  ) {}

  @Post()
  async create(@Body() dto: UserCreateDto) {
    return await this.userService.create(dto);
  }

  @Post('import')
  async import(@Request() req: FastifyRequest) {
    const data = await req.file();

    if (!data) {
      throw new FileRequiredException();
    }

    const delimiterField = data.fields.delimiter as
      | MultipartValue<string>
      | undefined;

    if (!delimiterField?.value) {
      throw new DelimiterRequiredException();
    }

    const buffer = await data.toBuffer();

    return await this.userImportService.import(buffer, delimiterField.value);
  }
}
