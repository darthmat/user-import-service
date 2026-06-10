import * as z from 'zod';

export const envSchema = z.object({
  host: z.string().default('localhost'),
  port: z.coerce.number().default(4000),
  database: z.object({
    host: z.string(),
    port: z.coerce.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
  }),
});

export const config = envSchema.parse({
  host: process.env.APP_HOST,
  port: process.env.PORT,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

export type Config = z.infer<typeof envSchema>;
