/**
 * 권한 세트 퍼미션 변경 커맨드
 */
export class UpdatePermissionSetPermissionsCommand {
  constructor(
    readonly id: string,
    readonly permissionCodes: string[],
  ) {}
}
