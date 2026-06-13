import { Body, Controller, Inject, Post, Request } from '@nestjs/common';
import { UserImportServicePort } from './user-import/user-import.port';
import { UserServicePort } from './user-service.port';
import { FileImportDto, UserCreateDto } from './user.dto';
import { FastifyRequest } from 'fastify';
import { MultipartValue } from '@fastify/multipart';

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
      throw new Error('File is required');
    }

    const { value: delimiter } = data.fields
      .delimiter as MultipartValue<string>;

    const buffer = await data.toBuffer();

    return await this.userImportService.import(buffer, delimiter);
  }
}
