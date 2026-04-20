import process from 'node:process';

export interface EnvConfig {
  PORT: number
  DATABASE_URL: string
  JWT_ACCESS_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_ACCESS_EXPIRES_IN: number
  JWT_REFRESH_EXPIRES_IN: number
  REDIS_URL: string
  NODE_ENV: string
  TCP_PORT: number
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT')),
  DATABASE_URL: getEnv('DATABASE_URL'),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: Number(getEnv('JWT_ACCESS_EXPIRES_IN')),
  JWT_REFRESH_EXPIRES_IN: Number(getEnv('JWT_REFRESH_EXPIRES_IN')),
  REDIS_URL: getEnv('REDIS_URL'),
  NODE_ENV: getEnv('NODE_ENV'),
  TCP_PORT: Number(getEnv('TCP_PORT')),
} as const;
