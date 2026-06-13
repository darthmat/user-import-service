import { ImportResult } from './user-import.types';

export abstract class UserImportServicePort {
  abstract import(buffer: Buffer, delimiter: string): Promise<ImportResult>;
}
