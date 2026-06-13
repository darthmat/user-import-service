"use server";

import { ServerActionResult } from "@/components/action-form";
import { userService } from "@/services";

export interface CreateUserFormData {
  username: string;
  email: string;
}

export async function createUserAction(
  data: unknown,
): Promise<ServerActionResult> {
  const formData = data as CreateUserFormData;
  await userService.createUser(formData);

  return { success: true, message: "User created successfully." };
}
