/**
 * 권한 세트 생성 커맨드
 */
export class CreatePermissionSetCommand {
  constructor(
    readonly code: string,
    readonly name: string,
    readonly description: string | undefined,
    readonly copyFromId?: string,
  ) {}
}
