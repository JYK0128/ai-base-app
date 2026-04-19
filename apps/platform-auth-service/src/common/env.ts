import process from 'node:process';

export interface EnvConfig {
  RABBITMQ_URL: string
  DATABASE_URL: string
  JWT_ACCESS_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_ACCESS_EXPIRES_IN: string
  JWT_REFRESH_EXPIRES_IN: string
  REDIS_URL: string
  PORT: number
  NODE_ENV: string
}

const EXPIRES_IN_PATTERN = /^\d+[smhd]$/;

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

const getRequiredExpiresInEnv = (key: string): string => {
  const value = getRequiredEnv(key);
  if (!EXPIRES_IN_PATTERN.test(value)) {
    throw new Error(
      `${key} must be in <number><unit> format (e.g. 15m, 7d, 12h, 30s)`,
    );
  }
  return value;
};

export const ENV: EnvConfig = {
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_ACCESS_SECRET: getRequiredEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getRequiredEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: getRequiredExpiresInEnv('JWT_ACCESS_EXPIRES_IN'),
  JWT_REFRESH_EXPIRES_IN: getRequiredExpiresInEnv('JWT_REFRESH_EXPIRES_IN'),
  REDIS_URL: getRequiredEnv('REDIS_URL'),
  PORT: Number(process.env['PORT'] || 3000),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
