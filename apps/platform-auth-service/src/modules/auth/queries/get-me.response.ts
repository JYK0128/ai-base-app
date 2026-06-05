import { type AccountStatus, type MemberAccount, type MemberStatus, type OrganizationStatus } from '@pkg/database';

import { extractPermissions } from '../auth.helpers';

export type AuthMeAccountInfo = {
  id: string
  email: string
  status: AccountStatus
  lastLoginAt: string | null
  passwordExpiresAt: string
  lockUntil: string | null
  isDormant: boolean
  isPasswordExpired: boolean
};

export type AuthMeMemberInfo = {
  id: string
  name: string
  status: MemberStatus
};

export type AuthMeOrganizationInfo = {
  id: string
  code: string
  name: string
  email: string
  status: OrganizationStatus
} | null;

export type AuthMeUserInfo = {
  account: AuthMeAccountInfo
  member: AuthMeMemberInfo
  organization: AuthMeOrganizationInfo
  permissions: string[]
  mustChangePassword: boolean
};

function toIsoString(value?: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function mapAuthMeUserInfo(account: MemberAccount): AuthMeUserInfo {
  const member = account.member;
  const organization = member.organization ?? null;
  const organizationId = organization?.id;
  const { permissions } = extractPermissions(member, organizationId);

  return {
    account: {
      id: account.id,
      email: account.email,
      status: account.status,
      lastLoginAt: toIsoString(account.lastLoginAt),
      passwordExpiresAt: account.passwordExpiresAt.toISOString(),
      lockUntil: toIsoString(account.lockUntil),
      isDormant: account.isDormant,
      isPasswordExpired: account.isPasswordExpired,
    },
    member: {
      id: member.id,
      name: member.name,
      status: member.status,
    },
    organization: organization
      ? {
        id: organization.id,
        code: organization.code,
        name: organization.name,
        email: organization.email,
        status: organization.status,
      }
      : null,
    permissions,
    mustChangePassword: account.isPasswordExpired,
  };
}
