import { CsvParserPort } from '.';
import { ParserOptions } from './csv-parser.port';

export class FakeCsvParser implements CsvParserPort<Record<string, string>> {
  private rows: Record<string, string>[] = [];

  setRows(rows: Record<string, string>[]): void {
    this.rows = rows;
  }

  async parse(
    _buffer: Buffer,
    options: ParserOptions,
  ): Promise<Record<string, string>[]> {
    options.validateHeaders?.(Object.keys(this.rows[0] ?? {}));
    return this.rows;
  }
}
