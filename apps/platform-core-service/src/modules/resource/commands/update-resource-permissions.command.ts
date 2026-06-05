import { type ResourceScope } from '@pkg/database';

/**
 * 플랫폼 리소스 권한 수정 커맨드
 */
export class UpdateResourcePermissionsCommand {
  constructor(
    readonly id: string,
    readonly scope: ResourceScope,
    readonly actions: string[],
    readonly constraint?: string,
  ) {}
}
