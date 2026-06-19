import type { FilterQuery } from '@mikro-orm/core';

import { OrganizationStatus } from './organization.constants';
import type { Organization } from './organization.entity';
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

export function buildOrganizationStatusFilter(
  status: OrganizationStatus | undefined,
): FilterQuery<Organization> {
  switch (status) {
    case OrganizationStatus.PENDING:
      return { metadata: { approvedAt: null, deactivatedAt: null, rejectedAt: null } };
    case OrganizationStatus.ACTIVE:
      return { metadata: { approvedAt: { $ne: null }, deactivatedAt: null, rejectedAt: null } };
    case OrganizationStatus.INACTIVE:
      return { metadata: { deactivatedAt: { $ne: null } } };
    case OrganizationStatus.REJECTED:
      return { metadata: { rejectedAt: { $ne: null } } };
    default:
      return {};
  }
}
