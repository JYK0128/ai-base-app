import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int(),
  DATABASE_URL: z.string().trim().min(1),
  REDIS_URL: z.string().trim().min(1),
  RABBITMQ_URL: z.string().trim().min(1),
  KAFKA_URL: z.string().trim().min(1),
  JWT_ACCESS_SECRET: z.string().trim().min(1),
  JWT_ACCESS_EXPIRES_IN: z.coerce.number().int(),
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().int(),
  NODE_ENV: z.string().trim().min(1),
  CORS_ORIGIN: z.string().trim().min(1),
});

const env = envSchema.parse(process.env);

export const ENV = {
  PORT: env.PORT,
  DATABASE_URL: env.DATABASE_URL,
  REDIS_URL: env.REDIS_URL,
  RABBITMQ_URL: env.RABBITMQ_URL,
  KAFKA_URL: env.KAFKA_URL,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
  NODE_ENV: env.NODE_ENV,
  CORS_ORIGIN: env.CORS_ORIGIN,
} as const;
