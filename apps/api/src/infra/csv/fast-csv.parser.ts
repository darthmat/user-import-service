import { CsvParserException, DelimiterMismatchException } from '@/utils/errors';
import { parseStream } from '@fast-csv/parse';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { CsvParserPort, ParserOptions } from './csv-parser.port';

@Injectable()
export class FastCsvParser<T extends object> extends CsvParserPort<T> {
  parse(buffer: Buffer, options: ParserOptions): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const rows: T[] = [];

      const csvStream = parseStream<T, T>(Readable.from(buffer), {
        headers: true,
        delimiter: options.delimiter,
        trim: true,
        ignoreEmpty: true,
      });

      csvStream.on('headers', (headers: string[]) => {
        try {
          options.validateHeaders?.(headers);
        } catch (error) {
          csvStream.destroy(
            headers.length === 1
              ? new DelimiterMismatchException(options.delimiter)
              : new CsvParserException('Invalid headers', { cause: error }),
          );
        }
      });

      csvStream
        .on('data', (row: T) => rows.push(row))
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
