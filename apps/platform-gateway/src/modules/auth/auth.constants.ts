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
  /** 관리자 공개가입 요청 */
  REGISTER: 'auth.register',
  /** 관리자 공개가입 이메일 인증 */
  REGISTER_VERIFY: 'auth.register.verify',
  /** 관리자 공개가입 이메일 인증 재발송 */
  REGISTER_RESEND: 'auth.register.resend',
  /** 최초 로그인 조직 생성 */
  ONBOARDING_ORGANIZATION: 'auth.onboarding.organization',
  /** 토큰 갱신 요청 */
  REFRESH: 'auth.refresh',
  /** 로그아웃 요청 */
  LOGOUT: 'auth.logout',
  /** 권한 조회 요청 */
  PERMISSIONS: 'auth.permissions',
  /** 세션 유효성 검증 */
  VALIDATE_SESSION: 'auth.validate_session',
  /** 비밀번호 변경 연장 */
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  DEFER_PASSWORD_CHANGE: 'auth.defer_password_change',
  /** 비밀번호 변경 */
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  CHANGE_PASSWORD: 'auth.change_password',
} as const;
