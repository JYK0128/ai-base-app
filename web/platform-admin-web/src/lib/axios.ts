import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';

import { accessTokenAtom } from '../stores/auth.store';

// 공통 응답 구조 정의
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
 * 🌟 통합 Axios 인스턴스
 * Orval의 mutator이자 앱 전체의 API 클라이언트로 사용됩니다.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// 1. 요청(Request) 인터셉터: accessToken 주입
axiosInstance.interceptors.request.use(
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

// 2. 응답(Response) 인터셉터: 데이터 추출 및 토큰 갱신
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 🌟 여기서 response.data(ApiResponse)를 바로 반환합니다.
    // Orval 클라이언트는 이 결과를 받아서 그대로 사용하게 됩니다.
    return response.data;
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(ensureError(error));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthPath = originalRequest.url?.startsWith('/api/v1/auth');

    // 401 에러(만료) 시 자동 갱신 로직
    if (error.response?.status === 401 && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.data.accessToken;
        const store = getDefaultStore();
        store.set(accessTokenAtom, newAccessToken);

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return axiosInstance(originalRequest);
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

// Orval의 ErrorType으로 사용될 타입 정의
export type ErrorType<Error> = Error;

export default axiosInstance;
