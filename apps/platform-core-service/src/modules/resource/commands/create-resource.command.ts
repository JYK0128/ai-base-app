import { ResourceType } from '@pkg/database';

/**
 * 플랫폼 리소스 생성 커맨드
 */
export class CreateResourceCommand {
  constructor(
    readonly code: string,
    readonly name: string,
    readonly type: ResourceType,
    readonly path?: string,
    readonly parentId?: string,
  ) {}
}
