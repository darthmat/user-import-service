"use client";

import { ReactNode, SubmitEvent, useRef } from "react";
import { toast } from "sonner";

export type ServerActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      errors: readonly string[];
    };

interface ActionFormProps<T> {
  action: (data: unknown) => Promise<ServerActionResult>;
  children: ReactNode;
  onSuccess?: (result: T) => void;
}

export function ActionForm<T extends ServerActionResult>({
  action,
  children,
  onSuccess,
}: ActionFormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = (await action(data)) as T;

      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        onSuccess?.(result);
      } else {
        result.errors.forEach((error) => toast.error(error));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? ((error.cause as string | undefined) ?? error.message)
          : "Unexpected error occurred.";

      toast.error(message);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
