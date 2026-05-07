import axios, { InternalAxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';

import { accessTokenAtom } from '../stores/auth.store';

// 에러 객체 보장 헬퍼 함수 (ESLint prefer-promise-reject-errors 해결)
const ensureError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

// 백엔드 API 기본 설정 (주소 등은 실제 환경에 맞게 수정해주세요)
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // 예시: 백엔드 API 주소
  withCredentials: true, // 🌟 중요: 쿠키(refreshToken)를 함께 전송하기 위해 필수!
});

// 1. 요청(Request) 인터셉터: API를 호출할 때마다 헤더에 accessToken을 자동으로 넣습니다.
apiClient.interceptors.request.use(
  (config) => {
    // Jotai 스토어에 직접 접근하여 토큰을 가져옵니다. (React 컴포넌트 밖에서도 가능)
    const store = getDefaultStore();
    const token = store.get(accessTokenAtom);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(ensureError(error)),
);

// 2. 응답(Response) 인터셉터: 401 에러(토큰 만료)가 발생하면 자동으로 갱신을 시도합니다.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(ensureError(error));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 권한 없음 에러이고, 아직 재시도하지 않은 요청인 경우
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지용 플래그

      try {
        // 서버의 Refresh 토큰 엔드포인트로 갱신 요청을 보냅니다.
        // 이 요청을 보낼 때 쿠키(refreshToken)가 자동으로 전송됩니다.
        const res = await axios.post<{ accessToken: string }>(
          'http://localhost:3000/api/auth/refresh', // 실제 갱신 API 주소로 변경
          {},
          { withCredentials: true },
        );

        // 응답으로 받은 새 accessToken을 추출
        const newAccessToken = res.data.accessToken;

        // 새 토큰을 Jotai 상태에 반영합니다.
        const store = getDefaultStore();
        store.set(accessTokenAtom, newAccessToken);

        // 실패했던 원래 요청의 헤더를 새 토큰으로 교체하고 다시 요청합니다!
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
      catch (refreshError) {
        // Refresh API마저 실패했다면 (refreshToken 만료 등) 완전히 로그아웃 처리
        const store = getDefaultStore();
        store.set(accessTokenAtom, null);

        // 에러를 반환하여 사용자가 로그인 페이지로 리다이렉트 되도록 유도
        return Promise.reject(ensureError(refreshError));
      }
    }

    return Promise.reject(ensureError(error));
  },
);
