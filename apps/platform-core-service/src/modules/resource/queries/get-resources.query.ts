import { type ResourceScope } from '@pkg/database';

/**
 * 플랫폼 리소스 트리 조회 쿼리
 */
export class GetResourcesQuery {
  constructor(
    readonly permissions: string[],
    readonly scope: ResourceScope,
    readonly filterByPermissions: boolean,
  ) {}
}
