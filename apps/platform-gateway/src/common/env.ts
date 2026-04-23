import process from 'node:process';

export interface EnvConfig {
  PORT: number
  JWT_ACCESS_SECRET: string
  JWT_ACCESS_EXPIRES_IN: number
  AUTH_SERVICE_HOST: string
  AUTH_SERVICE_PORT: number
  NODE_ENV: string
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

const getAuthServiceConfig = () => {
  const url = getEnv('AUTH_SERVICE_URL');
  const parts = url.split(':');
  if (parts.length !== 2) {
    throw new Error('AUTH_SERVICE_URL must be in "host:port" format (e.g., localhost:3001)');
  }
  return {
    host: parts[0],
    port: Number(parts[1]),
  };
};

const authConfig = getAuthServiceConfig();

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT')),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES_IN: Number(getEnv('JWT_ACCESS_EXPIRES_IN')),
  AUTH_SERVICE_HOST: authConfig.host,
  AUTH_SERVICE_PORT: authConfig.port,
  NODE_ENV: getEnv('NODE_ENV'),
} as const;
