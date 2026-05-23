/**
 * 리소스 권한 수정 커맨드
 */
export class UpdateResourcePermissionsCommand {
  constructor(
    readonly id: string,
    readonly actions: string[],
    readonly constraint?: string,
  ) {}
}
