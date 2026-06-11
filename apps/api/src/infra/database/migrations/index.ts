import { Migration, MigrationProvider } from 'kysely/migration';
import { initialMigration } from './00_initial.js';

/**
 * Database migrations in order; oldest first
 *
 * Important: Do not change the order of migrations once they have been applied to the database!
 */
const migrations: Migration[] = [initialMigration];

export class UserImportMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return Object.fromEntries(
      migrations.map((migration, index) => [
        // Kysely sorts alphabetically, so make sure that '11' comes after '2'
        // by padding to '02'
        index.toString().padStart(4, '0'),
        migration,
      ]),
    );
  }
}
