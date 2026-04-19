import process from 'node:process';

export interface EnvConfig {
  PORT: string
  RABBITMQ_URL: string
  AUTH_SERVICE_HOST: string
  AUTH_SERVICE_PORT: number
  JWT_ACCESS_SECRET: string
  REDIS_URL?: string
  NODE_ENV: string
}

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

const getOptionalEnv = (key: string) => {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
};

export const ENV: EnvConfig = {
  PORT: getRequiredEnv('PORT'),
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  AUTH_SERVICE_HOST: getRequiredEnv('AUTH_SERVICE_HOST'),
  AUTH_SERVICE_PORT: Number(getRequiredEnv('AUTH_SERVICE_PORT')),
  JWT_ACCESS_SECRET: getRequiredEnv('JWT_ACCESS_SECRET'),
  REDIS_URL: getOptionalEnv('REDIS_URL'),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
