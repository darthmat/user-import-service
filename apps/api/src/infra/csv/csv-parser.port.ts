// csv-parser.port.ts
export interface ParserOptions<T> {
  delimiter?: string;
  validateHeaders?: (headers: string[]) => void;
}

export abstract class CsvParserPort<T extends object> {
  abstract parse(buffer: Buffer, options: ParserOptions<T>): Promise<T[]>;
}
