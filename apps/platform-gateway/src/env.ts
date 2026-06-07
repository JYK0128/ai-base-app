import { z } from 'zod';

const hostPortSchema = z.string().trim().min(1).transform((value, ctx) => {
  const [host, portValue, extra] = value.split(':');
  if (!host || !portValue || extra) {
    ctx.addIssue({
      code: 'custom',
      message: 'must be in "host:port" format (e.g., localhost:3001)',
    });
    return z.NEVER;
  }

  const port = Number(portValue);
  if (!Number.isInteger(port)) {
    ctx.addIssue({
      code: 'custom',
      message: 'port must be an integer',
    });
    return z.NEVER;
  }

  return { host, port };
});

const envSchema = z.object({
  PORT: z.coerce.number().int(),
  JWT_ACCESS_SECRET: z.string().trim().min(1),
  JWT_ACCESS_EXPIRES_IN: z.coerce.number().int(),
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().int(),
  AUTH_SERVICE_URL: hostPortSchema,
  CORE_SERVICE_URL: hostPortSchema,
  NODE_ENV: z.string().trim().min(1),
  CORS_ORIGIN: z.string().trim().min(1),
});

const env = envSchema.parse(process.env);

export const ENV = {
  PORT: env.PORT,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
  AUTH_SERVICE_HOST: env.AUTH_SERVICE_URL.host,
  AUTH_SERVICE_PORT: env.AUTH_SERVICE_URL.port,
  CORE_SERVICE_HOST: env.CORE_SERVICE_URL.host,
  CORE_SERVICE_PORT: env.CORE_SERVICE_URL.port,
  NODE_ENV: env.NODE_ENV,
  CORS_ORIGIN: env.CORS_ORIGIN,
} as const;
