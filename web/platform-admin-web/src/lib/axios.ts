import axiosClient, { type AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';

import { accessTokenAtom } from '../stores/auth.store';

// 🌟 백엔드 공통 응답 구조 (내부 타입용)
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  traceId: string
  requestId: string
}

// 에러 객체 보장 헬퍼 함수
const ensureError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

/**
 * 🌟 내부 Axios 인스턴스
 * 실제 요청과 인터셉터 처리를 담당합니다.
 */
export const axios = axiosClient.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials: true,
});

// 1. 요청(Request) 인터셉터: accessToken 주입
axios.interceptors.request.use(
  (config) => {
    const store = getDefaultStore();
    const token = store.get(accessTokenAtom);

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: unknown) => Promise.reject(ensureError(error)),
);

// 2. 응답(Response) 인터셉터: 에러 처리 및 토큰 갱신
axios.interceptors.response.use(
  (response) => response.data,
  async (error: unknown) => {
    if (!axiosClient.isAxiosError(error)) {
      return Promise.reject(ensureError(error));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthPath = originalRequest.url?.startsWith('/api/v1/auth');

    // 401 에러(만료) 시 자동 갱신 로직
    if (error.response?.status === 401 && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axiosClient.post<ApiResponse<{ accessToken: string }>>(
          `${import.meta.env.VITE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.data.accessToken;
        const store = getDefaultStore();
        store.set(accessTokenAtom, newAccessToken);

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return axios(originalRequest);
      }
      catch (refreshError) {
        const store = getDefaultStore();
        store.set(accessTokenAtom, null);
        return Promise.reject(ensureError(refreshError));
      }
    }

    if (error.response?.data) {
      throw error.response.data;
    }

    throw error;
  },
);

export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axios(config);
};

export type ErrorType<Error> = AxiosError<Error>;

export default axiosInstance;
