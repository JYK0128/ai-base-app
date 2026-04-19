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
  /** 사용자 정보 조회 */
  GET_USER: 'auth.get_user',
  /** 인증 관련 이벤트 (비동기) */
  AUTH_EVENT: 'auth_event',
} as const;
