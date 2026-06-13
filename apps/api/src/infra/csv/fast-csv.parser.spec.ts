import { beforeEach, describe, expect, it } from 'vitest';
import { FastCsvParser } from './fast-csv.parser';
import { DelimiterMismatchException, CsvParserException } from '@/utils/errors';

describe('FastCsvParser', () => {
  let parser: FastCsvParser<Record<string, string>>;

  beforeEach(() => {
    parser = new FastCsvParser();
  });

  describe('parse', () => {
    it('parses valid csv', async () => {
      const csv = `username,email\nJohnDoe,john@example.com\nJaneDoe,jane@example.com`;
      const result = await parser.parse(Buffer.from(csv), { delimiter: ',' });

      expect(result).toEqual([
        { username: 'JohnDoe', email: 'john@example.com' },
        { username: 'JaneDoe', email: 'jane@example.com' },
      ]);
    });

    it('parses csv with semicolon delimiter', async () => {
      const csv = `username;email\nJohnDoe;john@example.com`;
      const result = await parser.parse(Buffer.from(csv), { delimiter: ';' });

      expect(result).toEqual([
        { username: 'JohnDoe', email: 'john@example.com' },
      ]);
    });

    it('trims whitespace from values', async () => {
      const csv = `username,email\n  JohnDoe  ,  john@example.com  `;
      const result = await parser.parse(Buffer.from(csv), { delimiter: ',' });

      expect(result).toEqual([
        { username: 'JohnDoe', email: 'john@example.com' },
      ]);
    });

    it('throws DelimiterMismatchException when wrong delimiter used', async () => {
      const csv = `username;email\nJohnDoe;john@example.com`;

      await expect(
        parser.parse(Buffer.from(csv), {
          delimiter: ',',
          validateHeaders: (headers) => {
            if (!headers.includes('username'))
              throw new Error('Missing header');
          },
        }),
      ).rejects.toThrow(DelimiterMismatchException);
    });

    it('throws CsvParserException when headers are invalid', async () => {
      const csv = `invalid,headers\nJohnDoe,john@example.com`;

      await expect(
        parser.parse(Buffer.from(csv), {
          delimiter: ',',
          validateHeaders: (headers) => {
            if (!headers.includes('username'))
              throw new Error('Missing header');
          },
        }),
      ).rejects.toThrow(CsvParserException);
    });

    it('ignores empty rows', async () => {
      const csv = `username,email\nJohnDoe,john@example.com\n\n`;
      const result = await parser.parse(Buffer.from(csv), { delimiter: ',' });

      expect(result).toHaveLength(1);
    });
  });
});
