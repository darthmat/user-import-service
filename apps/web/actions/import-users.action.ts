"use server";

import { ServerActionResult } from "@/components/action-form";
import { userService } from "@/services";
import type { ImportResult } from "@/services/user.types";

export interface ImportUsersFormData {
  file: File;
  delimiter: string;
}

export async function importUsersAction(
  data: unknown,
): Promise<ServerActionResult & { result?: ImportResult }> {
  const formData = data as ImportUsersFormData;
  const result = await userService.importUsers(
    formData.file,
    formData.delimiter,
  );

  return {
    success: true,
    message: `Imported ${result.succeeded.length} users.`,
    result,
  };
}
