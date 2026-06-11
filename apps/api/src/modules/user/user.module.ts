import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { config } from '@/config';
import { IUserRepository } from './user-repository.interface';
import { createDatabase } from '@/infra/database/db';
import { UserRepository } from './user.repository';
import { IUserService } from './user-service.interface';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: IUserRepository,
      useFactory: () => {
        const db = createDatabase(config.database);
        const userRepository = new UserRepository(db);
        return userRepository;
      },
    },
    {
      provide: IUserService,
      useFactory: (userRepository: IUserRepository) => {
        return new UserService(userRepository);
      },
      inject: [IUserRepository],
    },
  ],
})
export class UserModule {}
