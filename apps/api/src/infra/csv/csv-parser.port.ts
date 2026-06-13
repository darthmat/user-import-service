export interface ParserOptions {
  delimiter?: string;
  validateHeaders?: (headers: string[]) => void;
}

export abstract class CsvParserPort<T extends object> {
  abstract parse(buffer: Buffer, options: ParserOptions): Promise<T[]>;
}
