import { Kysely } from 'kysely';
import { createKyselyDialect } from './dialect.js';
import { UserImportServiceDatabaseTables } from './types.js';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createDatabase(
  config: DatabaseConfig,
): Kysely<UserImportServiceDatabaseTables> {
  return new Kysely<UserImportServiceDatabaseTables>({
    dialect: createKyselyDialect(config),
    log: ['error'],
  });
}
