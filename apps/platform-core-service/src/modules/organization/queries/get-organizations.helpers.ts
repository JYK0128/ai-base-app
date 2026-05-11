import { OrganizationStatus } from '@pkg/database';

export class GetOrganizationsQuery {
  constructor(
    public readonly status?: OrganizationStatus,
  ) {}
}
