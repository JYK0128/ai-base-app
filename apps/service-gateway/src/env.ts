import process from 'node:process';

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not defined`);
  return value;
};

// 앱에 필요한 필수 환경 변수들을 여기서 로드 시점에 즉시 검증합니다.
export const ENV = {
  PORT: getRequiredEnv('PORT'),
  RABBITMQ_URL: getRequiredEnv('RABBITMQ_URL'),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
