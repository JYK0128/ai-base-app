/**
 * 리프레시 토큰 커맨드
 */
export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}
