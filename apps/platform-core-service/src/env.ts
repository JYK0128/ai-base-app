import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int(),
  DATABASE_URL: z.string().trim().min(1),
  REDIS_URL: z.string().trim().min(1),
  NODE_ENV: z.string().trim().min(1),
  TCP_PORT: z.coerce.number().int(),
  JWT_ACCESS_SECRET: z.string().trim().min(1),
  JWT_REFRESH_SECRET: z.string().trim().min(1),
  JWT_ACCESS_EXPIRES_IN: z.coerce.number().int(),
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().int(),
});

export const ENV = envSchema.parse(process.env);
