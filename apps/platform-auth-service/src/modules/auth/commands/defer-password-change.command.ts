/**
 * 비밀번호 변경 유예 커맨드
 */
export class DeferPasswordChangeCommand {
  constructor(public readonly accountId: string) {}
}
