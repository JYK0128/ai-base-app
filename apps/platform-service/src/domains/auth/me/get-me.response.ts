import type { MemberAccount } from '@pkg/database';

import { withQueryPayloadResponse } from '@/common/interfaces';

export class GetMeResponsePayload extends withQueryPayloadResponse() {
  constructor({ account, permissions }: { account: MemberAccount, permissions: string[] }) {
    super();

    const member = account.member;
    const organization = member.organization ?? null;

    this.account = {
      id: account.id,
      email: account.email,
      status: account.status,
      lastLoginAt: account.lastLoginAt ? account.lastLoginAt.toISOString() : null,
      passwordExpiresAt: account.passwordExpiresAt.toISOString(),
      lockUntil: account.lockUntil ? account.lockUntil.toISOString() : null,
      isDormant: account.isDormant,
      isPasswordExpired: account.isPasswordExpired,
    };

    this.member = {
      id: member.id,
      name: member.name,
      status: member.status,
    };

    this.organization = organization
      ? {
        id: organization.id,
        code: organization.code,
        name: organization.name,
        email: organization.email,
        status: organization.status,
      }
      : null;

    this.permissions = permissions;
    this.mustChangePassword = account.isPasswordExpired;
  }

  account: {
    id: string
    email: string
    status: MemberAccount['status']
    lastLoginAt: string | null
    passwordExpiresAt: string
    lockUntil: string | null
    isDormant: boolean
    isPasswordExpired: boolean
  };

  member: {
    id: string
    name: string
    status: MemberAccount['member']['status']
  };

  organization: {
    id: string
    code: string
    name: string
    email: string
    status: NonNullable<MemberAccount['member']['organization']>['status']
  } | null;

  permissions: string[];

  mustChangePassword: boolean;
}
