import type { Organization, OrganizationStatus } from '@pkg/database';

export type GetOrganizationsInput = {
  status?: OrganizationStatus
};

export type ApproveOrganizationInput = Pick<Organization, 'id'> & {
  approve: boolean
};
