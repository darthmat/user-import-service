import { config } from '@/config';
import { FastCsvParser } from '@/infra/csv';
import { CsvParserPort } from '@/infra/csv/csv-parser.port';
import { createDatabase } from '@/infra/database/db';
import { Module } from '@nestjs/common';
import { UserImportServicePort } from './user-import/user-import.port';
import { UserImportService } from './user-import/user-import.service';
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
        return new UserRepository(db);
      },
    },
    {
      provide: CsvParserPort,
      useFactory: () => new FastCsvParser(),
    },
    {
      provide: UserServicePort,
      useFactory: (userRepository: UserRepositoryPort) => {
        return new UserService(userRepository);
      },
      inject: [UserRepositoryPort],
    },
    {
      provide: UserImportServicePort,
      useFactory: (
        userRepository: UserRepositoryPort,
        csvParser: CsvParserPort<Record<string, string>>,
      ) => {
        return new UserImportService(csvParser, userRepository);
      },
      inject: [UserRepositoryPort, CsvParserPort],
    },
  ],
})
export class UserModule {}
