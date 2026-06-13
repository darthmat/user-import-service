import { z } from "zod";

const envSchema = z.object({
  apiUrl: z.url().default("http://localhost:4000"),
});

export const config = envSchema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
});

export type Config = z.infer<typeof envSchema>;
