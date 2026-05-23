/**
 * 비밀번호 변경 커맨드
 */
export class ChangePasswordCommand {
  constructor(
    public readonly id: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}
