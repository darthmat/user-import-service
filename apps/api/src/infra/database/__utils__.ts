import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import assert from 'assert';
import { sql } from 'kysely';
import { Migrator } from 'kysely/migration';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createDatabase } from './db.js';
import { UserImportMigrationProvider } from './migrations/index.js';
import { Database } from './types.js';

/**
 * Spins up a PostgreSQL container
 */
export function withDatabase() {
  let postgresContainer: StartedPostgreSqlContainer;
  let db: Database;
  let invalidDb: Database;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:alpine')
      .withCommand([
        'postgres',
        '-c',
        'fsync=off',
        '-c',
        'full_page_writes=off',
        '-c',
        'synchronous_commit=off',
      ])
      .withStartupTimeout(120_000)
      .start();

    db = createDatabase({
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      user: postgresContainer.getUsername(),
      password: postgresContainer.getPassword(),
      database: postgresContainer.getDatabase(),
    });

    invalidDb = createDatabase({
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      user: postgresContainer.getUsername(),
      password: 'empty',
      database: postgresContainer.getDatabase(),
    });

    await runMigrations(db);
  });

  afterAll(async () => {
    await db.destroy();
    await invalidDb.destroy();
    await postgresContainer.stop();
  });

  afterEach(async () => {
    await sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;`.execute(
      db,
    );

    await runMigrations(db);
  });

  return {
    getDb: () => db,
    getInvalidDb: () => invalidDb,
  };
}

async function runMigrations(db: Database): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new UserImportMigrationProvider(),
  });

  const result = await migrator.migrateToLatest();

  if (result.error) {
    assert(result.error instanceof Error);
    throw result.error;
  }
}
