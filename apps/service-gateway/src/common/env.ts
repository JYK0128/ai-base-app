import process from 'node:process';

export interface EnvConfig {
  PORT: number
  JWT_ACCESS_SECRET: string
  JWT_ACCESS_EXPIRES_IN: number
  AUTH_SERVICE_HOST: string
  AUTH_SERVICE_PORT: number
  REDIS_URL: string
  NODE_ENV: string
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT')),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES_IN: Number(getEnv('JWT_ACCESS_EXPIRES_IN')),
  AUTH_SERVICE_HOST: getEnv('AUTH_SERVICE_HOST'),
  AUTH_SERVICE_PORT: Number(getEnv('AUTH_SERVICE_PORT')),
  REDIS_URL: getEnv('REDIS_URL'),
  NODE_ENV: getEnv('NODE_ENV'),
} as const;
