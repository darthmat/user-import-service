import { sql } from 'kysely';
import { Migration } from 'kysely/migration';

/**
 * Initial migration for settings up the database.
 */
export const initialMigration: Migration = {
  async up(db) {
    await db.schema
      .createTable('users')
      .addColumn('id', 'uuid', (col) => col.notNull())
      .addColumn('username', 'text', (col) => col.notNull().unique())
      .addColumn('email', 'text', (col) => col.notNull().unique())
      .addColumn('created_at', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`now()`),
      )
      .execute();
  },
  async down(db) {
    await db.schema.dropTable('users').execute();
  },
};
