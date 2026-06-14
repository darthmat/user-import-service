import assert from "assert";
import { IUserService } from "./user.interface";
import type { ImportResult, User } from "./user.types";

export class UserServiceImpl implements IUserService {
  constructor(
    private readonly apiUrl: string,
    private readonly customFetch = fetch,
  ) {}

  async createUser(data: { username: string; email: string }): Promise<User> {
    const res = await this.customFetch(`${this.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error("Failed to create user.", { cause: json.message });
    }

    assert(json.id, "Expected user id in response");

    return json;
  }

  async importUsers(file: File, delimiter: string): Promise<ImportResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("delimiter", delimiter);

    const res = await this.customFetch(`${this.apiUrl}/users/import`, {
      method: "POST",
      body: form,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error("Failed to import users.", { cause: json.message });
    }

    assert(
      Array.isArray(json.succeeded),
      "Expected succeeded array in response",
    );
    assert(Array.isArray(json.failed), "Expected failed array in response");

    return json;
  }
}
