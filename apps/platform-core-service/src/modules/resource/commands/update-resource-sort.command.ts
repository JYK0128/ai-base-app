import { type ResourceScope } from '@pkg/database';

/**
 * 플랫폼 리소스 정렬 순서 수정 커맨드
 */
export class UpdateResourceSortCommand {
  constructor(
    readonly scope: ResourceScope,
    readonly items: Array<{ id: string, sortOrder: number }>,
  ) {}
}
