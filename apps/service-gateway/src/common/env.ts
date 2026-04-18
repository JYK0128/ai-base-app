import process from 'node:process';

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV = {
  PORT: getRequiredEnv('PORT'),
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  AUTH_SERVICE_HOST: getRequiredEnv('AUTH_SERVICE_HOST'),
  AUTH_SERVICE_PORT: Number(getRequiredEnv('AUTH_SERVICE_PORT')),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
