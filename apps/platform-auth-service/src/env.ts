import process from 'node:process';

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV = {
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  PORT: Number(process.env['PORT'] || 3000),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
