import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int(),
  DATABASE_URL: z.string().trim().min(1),
  REDIS_URL: z.string().trim().min(1),
  SESSION_SECRET: z.string().trim().min(1),
  SESSION_COOKIE_NAME: z.string().trim().min(1),
  CSRF_COOKIE_NAME: z.string().trim().min(1),
  RABBITMQ_URL: z.string().trim().min(1),
  SESSION_EXPIRES_IN: z.coerce.number().int(),
  MAIL_HOST: z.string().trim().min(1),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_SECURE: z.stringbool(),
  MAIL_USER: z.string().trim().min(1),
  MAIL_PASS: z.string().trim().min(1),
  CLIENT_URL: z.string().trim().min(1),
  NODE_ENV: z.string().trim().min(1),
  CORS_ORIGIN: z.string().trim().min(1),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int(),
  LOGIN_ATTEMPT_TTL: z.coerce.number().int(),
  LOGIN_LOCK_TTL: z.coerce.number().int(),
  PASSWORD_EXPIRY_DAYS: z.coerce.number().int().positive(),
});

const env = envSchema.parse(process.env);
const withHostPrefix = (cookieName: string) => (env.NODE_ENV === 'production' ? `__Host-${cookieName}` : cookieName);

export const ENV = {
  PORT: env.PORT,
  DATABASE_URL: env.DATABASE_URL,
  REDIS_URL: env.REDIS_URL,
  SESSION_SECRET: env.SESSION_SECRET,
  SESSION_COOKIE_NAME: withHostPrefix(env.SESSION_COOKIE_NAME),
  CSRF_COOKIE_NAME: withHostPrefix(env.CSRF_COOKIE_NAME),
  RABBITMQ_URL: env.RABBITMQ_URL,
  SESSION_EXPIRES_IN: env.SESSION_EXPIRES_IN,
  MAIL_HOST: env.MAIL_HOST,
  MAIL_PORT: env.MAIL_PORT,
  MAIL_SECURE: env.MAIL_SECURE,
  MAIL_USER: env.MAIL_USER,
  MAIL_PASS: env.MAIL_PASS,
  CLIENT_URL: env.CLIENT_URL,
  NODE_ENV: env.NODE_ENV,
  CORS_ORIGIN: env.CORS_ORIGIN,
  LOGIN_MAX_ATTEMPTS: env.LOGIN_MAX_ATTEMPTS,
  LOGIN_ATTEMPT_TTL: env.LOGIN_ATTEMPT_TTL,
  LOGIN_LOCK_TTL: env.LOGIN_LOCK_TTL,
  PASSWORD_EXPIRY_DAYS: env.PASSWORD_EXPIRY_DAYS,
} as const;
