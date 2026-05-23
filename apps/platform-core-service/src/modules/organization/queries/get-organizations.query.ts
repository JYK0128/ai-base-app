import { OrganizationStatus } from '@pkg/database';

/**
 * 조직 목록 조회 쿼리
 */
export class GetOrganizationsQuery {
  constructor(
    public readonly status?: OrganizationStatus,
  ) {}
}
