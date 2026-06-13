import { UserCreateDto } from '../user.dto';
import { User } from '../user.model';

export interface ImportSuccess {
  user: User;
  row: number;
}

export interface ImportFailure {
  row: number;
  dto: Partial<UserCreateDto>;
  error: string;
}

export interface ImportResult {
  succeeded: ImportSuccess[];
  failed: ImportFailure[];
}

export type UserCreateResult =
  | { success: true; user: User }
  | { success: false; error: string };
