import { CsvParserPort } from '@/infra/csv';
import { CsvTooLargeException, ValidationError } from '@/utils/errors';
import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../user-repository.port';
import { EXPECTED_HEADERS, UserCreateDto } from '../user.dto';
import { User } from '../user.model';
import { UserImportServicePort } from './user-import.port';
import {
  ImportFailure,
  ImportResult,
  ImportSuccess,
  UserCreateResult,
} from './user-import.types';

@Injectable()
export class UserImportService implements UserImportServicePort {
  private static readonly MAX_ROWS = 1000;
  private static readonly CSV_DATA_START_ROW = 2;
  private static readonly BATCH_SIZE = 500;

  constructor(
    private readonly csvParser: CsvParserPort<Record<string, string>>,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async import(buffer: Buffer, delimiter: string): Promise<ImportResult> {
    const rows = await this.parseCsv(buffer, delimiter);
    const { succeeded, failed } = this.buildUsers(rows);
    const savedIds = await this.persistUsers(succeeded);

    const finalSucceeded = succeeded.filter((s) => savedIds.has(s.user.id));
    const conflicts: ImportFailure[] = succeeded
      .filter((s) => !savedIds.has(s.user.id))
      .map((s) => ({
        success: false,
        row: s.row,
        dto: { username: s.user.username, email: s.user.email },
        error: 'User with this email or username already exists',
      }));

    return {
      succeeded: finalSucceeded,
      failed: [...failed, ...conflicts].sort((a, b) => a.row - b.row),
    };
  }

  private async parseCsv(
    buffer: Buffer,
    delimiter: string,
  ): Promise<UserCreateDto[]> {
    const rows = await this.csvParser.parse(buffer, {
      delimiter,
      validateHeaders: (headers: string[]) => {
        const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          throw new ValidationError(
            `Missing required headers: ${missing.join(', ')}`,
          );
        }
      },
    });

    this.assertRowLimit(rows);

    return rows.map(UserImportService.mapRowToDto);
  }

  private buildUsers(
    rows: UserCreateDto[],
  ): Pick<ImportResult, 'succeeded' | 'failed'> {
    const succeeded: ImportSuccess[] = [];
    const failed: ImportFailure[] = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + UserImportService.CSV_DATA_START_ROW;
      const result = this.tryCreateUser(row);

      if (result.success) {
        succeeded.push({ user: result.user, row: rowNumber });
      } else {
        failed.push({ row: rowNumber, dto: row, error: result.error });
      }
    }

    return { succeeded, failed };
  }

  private tryCreateUser(row: UserCreateDto): UserCreateResult {
    try {
      return { success: true, user: User.create(row) };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ValidationError ? error.message : 'Unexpected error',
      };
    }
  }

  private async persistUsers(succeeded: ImportSuccess[]): Promise<Set<string>> {
    if (succeeded.length === 0) return new Set();

    const savedIds = new Set<string>();

    for (let i = 0; i < succeeded.length; i += UserImportService.BATCH_SIZE) {
      const batch = succeeded.slice(i, i + UserImportService.BATCH_SIZE);
      const { savedIds: batchIds } = await this.userRepository.saveMany(
        batch.map((s) => s.user),
      );

      batchIds.forEach((id) => savedIds.add(id));
    }

    return savedIds;
  }

  private assertRowLimit(rows: Record<string, string>[]): void {
    if (rows.length > UserImportService.MAX_ROWS) {
      throw new CsvTooLargeException(rows.length, UserImportService.MAX_ROWS);
    }
  }

  private static readonly mapRowToDto = (
    row: Record<string, string>,
  ): UserCreateDto => ({
    username: row.username ?? '',
    email: row.email ?? '',
  });
}
