import process from 'node:process';

export interface EnvConfig {
  RABBITMQ_URL: string
  DATABASE_URL: string
  PORT: number
  NODE_ENV: string
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV: EnvConfig = {
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  PORT: Number(process.env['PORT'] || 3000),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
