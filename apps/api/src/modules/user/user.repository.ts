/* eslint-disable @typescript-eslint/naming-convention -- Kysely expect snake case for database*/
import { Database } from '@/infra/database/types';
import { UserRepositoryPort } from './user-repository.port';
import { User } from './user.model';

export class UserRepository implements UserRepositoryPort {
  constructor(private readonly db: Database) {}
  async save(user: User): Promise<boolean> {
    const result = await this.db
      .insertInto('users')
      .values({
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.createdAt,
      })
      .onConflict((oc) => oc.doNothing())
      .returning('id')
      .executeTakeFirst();

    return !!result;
  }
}
