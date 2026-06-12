import { config } from '@/config';
import { createDatabase } from '@/infra/database/db';
import { Module } from '@nestjs/common';
import { UserRepositoryPort } from './user-repository.port';
import { UserServicePort } from './user-service.port';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserRepositoryPort,
      useFactory: () => {
        const db = createDatabase(config.database);
        const userRepository = new UserRepository(db);
        return userRepository;
      },
    },
    {
      provide: UserServicePort,
      useFactory: (userRepository: UserRepositoryPort) => {
        return new UserService(userRepository);
      },
      inject: [UserRepositoryPort],
    },
  ],
})
export class UserModule {}
