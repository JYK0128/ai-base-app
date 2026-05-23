import { ResourceType } from '@pkg/database';

/**
 * 리소스 생성 커맨드
 */
export class CreateResourceCommand {
  constructor(
    readonly code: string,
    readonly name: string,
    readonly type: ResourceType,
    readonly path?: string,
    readonly icon?: string,
    readonly parentId?: string,
    readonly sortOrder?: number,
  ) {}
}
