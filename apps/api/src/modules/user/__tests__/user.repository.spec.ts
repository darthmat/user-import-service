import { withDatabase } from '@/infra/database/__utils__';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserRepository } from '../user.repository';
import { createFakeUser } from './__utils__';
import { uuidv7 } from 'uuidv7';

describe('UserRepository', () => {
  let repository: UserRepository;

  const { getDb } = withDatabase();

  beforeEach(() => {
    const db = getDb();
    repository = new UserRepository(db);
  });

  describe('save', () => {
    it('saves new user and returns true', async () => {
      const id = uuidv7();
      const user = createFakeUser({ id });

      const result = await repository.save(user);

      expect(result).toBe(true);
    });

    it('returns false on duplicate', async () => {
      const id = uuidv7();
      const user = createFakeUser({ id });

      await repository.save(user);

      const result = await repository.save(user);

      expect(result).toBe(false);
    });
  });

  describe('saveMany', () => {
    it('returns savedIds for inserted users', async () => {
      const id1 = uuidv7();
      const id2 = uuidv7();

      const users = [
        createFakeUser({ id: id1, email: 'a@example.com', username: 'UserA' }),
        createFakeUser({ id: id2, email: 'b@example.com', username: 'UserB' }),
      ];

      const { savedIds } = await repository.saveMany(users);

      expect(savedIds).toEqual(new Set([id1, id2]));
    });

    it('skips duplicates and returns only new ids', async () => {
      const id1 = uuidv7();
      const id2 = uuidv7();
      const existing = createFakeUser({
        id: id1,
        email: 'a@example.com',
        username: 'UserA',
      });

      await repository.save(existing);

      const { savedIds } = await repository.saveMany([
        existing,
        createFakeUser({ id: id2, email: 'b@example.com', username: 'UserB' }),
      ]);

      expect(savedIds).toEqual(new Set([id2]));
    });

    it('returns empty set for empty input', async () => {
      const { savedIds } = await repository.saveMany([]);

      expect(savedIds).toEqual(new Set());
    });
  });
});
