import process from 'node:process';

export interface EnvConfig {
  PORT: number
  JWT_ACCESS_SECRET: string
  JWT_ACCESS_EXPIRES_IN: number
  AUTH_SERVICE_HOST: string
  AUTH_SERVICE_PORT: number
  CORE_SERVICE_HOST: string
  CORE_SERVICE_PORT: number
  NODE_ENV: string
  CORS_ORIGIN?: string
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

const parseServiceUrl = (serviceUrl: string | undefined): { host: string, port: number } => {
  if (!serviceUrl) {
    throw new Error('Service URL is required');
  }

  const [host, portValue, extra] = String(serviceUrl).split(':');
  if (!host || !portValue || extra) {
    throw new Error('Service URL must be in "host:port" format (e.g., localhost:3001)');
  }

  const port = Number(portValue);
  if (!Number.isInteger(port)) {
    throw new Error('Service URL port must be an integer');
  }

  return {
    host,
    port,
  };
};

const authConfig = parseServiceUrl(getEnv('AUTH_SERVICE_URL'));
const coreConfig = parseServiceUrl(getEnv('CORE_SERVICE_URL'));

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT')),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES_IN: Number(getEnv('JWT_ACCESS_EXPIRES_IN')),
  AUTH_SERVICE_HOST: authConfig.host,
  AUTH_SERVICE_PORT: authConfig.port,
  CORE_SERVICE_HOST: coreConfig.host,
  CORE_SERVICE_PORT: coreConfig.port,
  NODE_ENV: getEnv('NODE_ENV'),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
} as const;
