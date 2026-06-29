import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import axiosClient, { AxiosHeaders } from 'axios';

import type { ApiResponse } from '@/api/generated/model';

const readEnvValue = (key: keyof ImportMetaEnv): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === 'string' ? value.trim() : '';
};

const API_BASE_URL = readEnvValue('VITE_URL');
const CSRF_ENDPOINT_PATH = '/api/v1/auth/csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

type CsrfApiResponse = {
  success: boolean
  data?: {
    csrfToken?: string
  }
};

const csrfClient = axiosClient.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

const ensureError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

const isCsrfProtectedMethod = (method?: string): boolean => {
  const httpMethod = method?.toLowerCase();
  if (httpMethod) {
    return ['post', 'put', 'patch', 'delete'].includes(httpMethod);
  }
  return false;
};

export const clearCsrfToken = (): void => {
  csrfToken = null;
  csrfTokenPromise = null;
};

const readCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = csrfClient
      .get<CsrfApiResponse>(CSRF_ENDPOINT_PATH)
      .then(({ data }) => {
        const token = data.data?.csrfToken?.trim();

        if (!token) {
          throw new Error('CSRF token was not returned by the server.');
        }

        csrfToken = token;
        return token;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
};

/**
 * 내부 Axios 인스턴스
 * 쿠키 기반 세션을 전송하고 응답 본문을 그대로 반환합니다.
 */
const axios = axiosClient.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!isCsrfProtectedMethod(config.method)) {
      return config;
    }

    const token = await readCsrfToken();
    const headers = AxiosHeaders.from(config.headers);
    headers.set(CSRF_HEADER_NAME, token);
    config.headers = headers;
    return config;
  },
  (error: unknown) => Promise.reject(ensureError(error)),
);

axios.interceptors.response.use(
  // AxiosResponse 객체에서 실제 서버 응답(response.data)을 꺼낸다.
  (response) => response.data,
  (error: unknown) => {
    if (!axiosClient.isAxiosError(error)) {
      return Promise.reject(ensureError(error));
    }

    return Promise.reject(error);
  },
);

const axiosInstance = <T extends { data?: unknown }>(config: AxiosRequestConfig): Promise<T['data']> => {
  // 위 interceptor를 거친 뒤의 응답 본문에서 data 필드만 다시 꺼낸다.
  return axios(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error & ApiResponse>;
export type BodyType<BodyData> = BodyData;

export default axiosInstance;
