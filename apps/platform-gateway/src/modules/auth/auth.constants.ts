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
  /** 비밀번호 변경 연장 */
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  DEFER_PASSWORD_CHANGE: 'auth.defer_password_change',
  /** 비밀번호 변경 */
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  CHANGE_PASSWORD: 'auth.change_password',
} as const;
