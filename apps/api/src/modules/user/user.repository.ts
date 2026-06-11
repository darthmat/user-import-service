/* eslint-disable @typescript-eslint/naming-convention -- Kysely expect snake case for database*/
import { Database } from '@/infra/database/types';
import { IUserRepository } from './user-repository.interface';
import { User } from './user.model';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}
  async save(user: User): Promise<void> {
    await this.db
      .insertInto('users')
      .values({
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.createdAt,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();
  }
}
