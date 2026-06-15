export const MemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type MemberStatus = typeof MemberStatus[keyof typeof MemberStatus];

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus];

export const MemberInviteStatus = {
  QUEUED: 'QUEUED',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export type MemberInviteStatus = typeof MemberInviteStatus[keyof typeof MemberInviteStatus];
