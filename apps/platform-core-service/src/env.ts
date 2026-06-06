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
  MAIL_HOST: z.string().trim().min(1),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_SECURE: z.stringbool(),
  MAIL_PASS: z.string().trim().min(1),
  MAIL_USER: z.string().trim().min(1),
  CLIENT_URL: z.string().trim().min(1),
  RABBITMQ_URL: z.string().trim().min(1),
});

export const ENV = envSchema.parse(process.env);
