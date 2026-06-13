/* eslint-disable @typescript-eslint/naming-convention */
import { Generated, Kysely } from 'kysely';

export type Database = Kysely<UserImportServiceDatabaseTables>;

export interface UserImportServiceDatabaseTables {
  users: UsersTable;
}

interface UsersTable {
  id: string;
  username: string;
  email: string;
  created_at: Generated<Date>;
}
