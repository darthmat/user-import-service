export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ImportSuccess {
  user: User;
  row: number;
}

export interface ImportFailure {
  row: number;
  dto: Partial<{ username: string; email: string }>;
  error: string;
}

export interface ImportResult {
  succeeded: ImportSuccess[];
  failed: ImportFailure[];
}
