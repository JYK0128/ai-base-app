/**
 * 인증 마이크로서비스와의 통신을 위한 메시지 패턴 상수 정의
 */
export const AUTH_SERVICE_PATTERNS = {
  /** 로그인 요청 */
  LOGIN: 'auth.login',
  /** 사용자 정보 조회 */
  GET_USER: 'auth.get_user',
  /** 인증 관련 이벤트 (비동기) */
  AUTH_EVENT: 'auth_event',
} as const;
