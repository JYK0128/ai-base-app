import { OrganizationStatus } from './organization.constants';
import type { OrganizationMetadata } from './organization.entity';

export function getOrganizationStatus(
  metadata: Pick<OrganizationMetadata, 'approvedAt' | 'deactivatedAt' | 'rejectedAt'> | undefined,
): OrganizationStatus {
  if (metadata?.rejectedAt) {
    return OrganizationStatus.REJECTED;
  }

  if (metadata?.deactivatedAt) {
    return OrganizationStatus.INACTIVE;
  }

  if (metadata?.approvedAt) {
    return OrganizationStatus.ACTIVE;
  }

  return OrganizationStatus.PENDING;
}

export function isOrganizationActive(status: OrganizationStatus | undefined): boolean {
  return status === OrganizationStatus.ACTIVE;
}
