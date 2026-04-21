/**
 * 인증 마이크로서비스 인젝션 토큰 (Symbol)
 */
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

/**
 * 인증 마이크로서비스와의 통신을 위한 메시지 패턴 상수 정의
 */
export const AUTH_SERVICE_PATTERNS = {
  /** 로그인 요청 */
  LOGIN: 'auth.login',
  /** 토큰 갱신 요청 */
  REFRESH: 'auth.refresh',
  /** 로그아웃 요청 */
  LOGOUT: 'auth.logout',
} as const;
