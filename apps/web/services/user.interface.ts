import { ImportResult, User } from "./user.types";

export interface IUserService {
  createUser(data: { username: string; email: string }): Promise<User>;
  importUsers(file: File, delimiter: string): Promise<ImportResult>;
}
