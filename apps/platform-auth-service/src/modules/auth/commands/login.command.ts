/**
 * 로그인 커맨드
 */
export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly clientIp: string,
  ) {}
}

/**
 * 로그인 에러 외부 노출 메타데이터 (Public)
 */
export type LOGIN_METADATA = {
  attempts?: number
  maxAttempts?: number
  retryAfterSeconds?: number
  accessToken?: string
};

/**
 * 로그인 에러 내부 처리 컨텍스트 (Private)
 */
export type LOGIN_CONTEXT = {
  email: string
};
