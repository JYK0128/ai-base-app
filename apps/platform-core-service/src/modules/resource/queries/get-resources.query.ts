/**
 * 자원 트리 조회 쿼리
 */
export class GetResourcesQuery {
  constructor(
    readonly permissions?: string[],
    readonly roles?: string[],
  ) {}
}
