import process from 'node:process';

export interface EnvConfig {
  PORT: number
  RABBITMQ_URL: string
  JWT_ACCESS_SECRET: string
  AUTH_SERVICE_URL: string
  NODE_ENV: string
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT')),
  RABBITMQ_URL: getEnv('RABBITMQ_URL'),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  AUTH_SERVICE_URL: getEnv('AUTH_SERVICE_URL'),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
