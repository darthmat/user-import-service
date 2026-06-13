import { ConflictException } from '@/utils/errors';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserService } from '../user.service';
import { FakeUserRepository } from '../user-repository.fake';

describe('UserService', () => {
  let repository: FakeUserRepository;
  let service: UserService;

  beforeEach(() => {
    repository = new FakeUserRepository();
    service = new UserService(repository);
  });

  describe('create', () => {
    it('creates and returns user', async () => {
      const result = await service.create({
        username: 'JohnDoe',
        email: 'johndoe@example.com',
      });

      expect(result).toEqual({
        id: expect.any(String),
        username: 'JohnDoe',
        email: 'johndoe@example.com',
        createdAt: expect.any(Date),
      });
    });

    it('saves user to repository', async () => {
      await service.create({
        username: 'JohnDoe',
        email: 'johndoe@example.com',
      });

      expect(repository.size()).toBe(1);
    });

    it('throws ConflictException on duplicate', async () => {
      const dto = { username: 'JohnDoe', email: 'johndoe@example.com' };
      await service.create(dto);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
