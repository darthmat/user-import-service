import { FakeCsvParser } from '@/infra/csv/csv-parser.fake';
import { CsvTooLargeException, ValidationError } from '@/utils/errors';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserImportService } from '../user-import/user-import.service';
import { FakeUserRepository } from '../user-repository.fake';

describe('UserImportService', () => {
  let repository: FakeUserRepository;
  let parser: FakeCsvParser;
  let service: UserImportService;

  beforeEach(() => {
    repository = new FakeUserRepository();
    parser = new FakeCsvParser();
    service = new UserImportService(parser, repository);
  });

  describe('buildUsers', () => {
    it('valid row goes to succeeded', async () => {
      parser.setRows([{ username: 'JohnDoe', email: 'john@example.com' }]);

      const result = await service.import(Buffer.from(''), ',');

      expect(result.succeeded).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
    });

    it('invalid row goes to failed', async () => {
      parser.setRows([{ username: '', email: 'john@example.com' }]);

      const result = await service.import(Buffer.from(''), ',');

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]?.error).toBe(
        'Validation failed: Username cannot be empty',
      );
    });

    it('row number starts at 2', async () => {
      parser.setRows([{ username: '', email: 'john@example.com' }]);

      const result = await service.import(Buffer.from(''), ',');

      expect(result.failed[0]?.row).toBe(2);
    });
  });

  describe('persistUsers', () => {
    it('saves valid users to repository', async () => {
      parser.setRows([
        { username: 'JohnDoe', email: 'john@example.com' },
        { username: 'JaneDoe', email: 'jane@example.com' },
      ]);

      await service.import(Buffer.from(''), ',');

      expect(repository.size()).toBe(2);
    });

    it('processes users in batches of 500', async () => {
      const rows = Array.from({ length: 501 }, (_, i) => ({
        username: `User${i}`,
        email: `user${i}@example.com`,
      }));
      parser.setRows(rows);

      const saveManyCallCount = { count: 0 };

      const originalSaveMany = repository.saveMany.bind(repository);

      repository.saveMany = async (users) => {
        saveManyCallCount.count++;
        return await originalSaveMany(users);
      };

      await service.import(Buffer.from(''), ',');

      expect(saveManyCallCount.count).toBe(2);
    });

    it('conflict goes to failed with correct error', async () => {
      parser.setRows([{ username: 'JohnDoe', email: 'john@example.com' }]);
      await service.import(Buffer.from(''), ',');

      parser.setRows([{ username: 'JohnDoe', email: 'john@example.com' }]);
      const result = await service.import(Buffer.from(''), ',');

      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]?.error).toBe(
        'User with this email or username already exists',
      );
    });
  });

  describe('import', () => {
    it('throws CsvTooLargeException when rows exceed 1000', async () => {
      const rows = Array.from({ length: 1001 }, (_, i) => ({
        username: `User${i}`,
        email: `user${i}@example.com`,
      }));
      parser.setRows(rows);

      await expect(service.import(Buffer.from(''), ',')).rejects.toThrow(
        CsvTooLargeException,
      );
    });

    it('throws ValidationError when required headers are missing', async () => {
      parser.setRows([{ invalid_header: 'value' }]);

      await expect(service.import(Buffer.from(''), ',')).rejects.toThrow(
        ValidationError,
      );
    });

    it('failed sorted by row number', async () => {
      parser.setRows([{ username: 'UserA', email: 'a@example.com' }]);
      await service.import(Buffer.from(''), ',');

      parser.setRows([
        { username: '', email: 'x@example.com' },
        { username: 'UserA', email: 'a@example.com' },
        { username: '', email: 'y@example.com' },
        { username: 'UserB', email: 'b@example.com' },
      ]);
      const result = await service.import(Buffer.from(''), ',');

      expect(result.failed.map((f) => f.row)).toEqual([2, 3, 4]);
    });
  });
});
