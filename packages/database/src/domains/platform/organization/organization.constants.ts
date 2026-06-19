export const OrganizationStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  REJECTED: 'REJECTED',
} as const;

export type OrganizationStatus = typeof OrganizationStatus[keyof typeof OrganizationStatus];
