import { config } from '@/config';
import { Migrator } from 'kysely/migration';
import { createDatabase } from './db';
import { UserImportMigrationProvider } from './migrations';

async function main() {
  const db = createDatabase(config.database);

  try {
    const migrator = new Migrator({
      db,
      provider: new UserImportMigrationProvider(),
    });
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(
          `Migration '${it.migrationName}' was executed successfully.`,
        );
      } else if (it.status === 'Error') {
        console.error(`Failed to execute migration '${it.migrationName}.'`);
      }
    });

    if (!results?.length) {
      console.log('No migrations run.');
    }

    if (error) {
      console.error('Failed to migrate.');
      process.exit(1);
    }
  } finally {
    await db.destroy();
  }
}

void main();
