import type { Loaded } from '@mikro-orm/core';
import { type Member, type MemberInvite, MemberStatus as DbMemberStatus, type Organization, type OrganizationRoleAssignment } from '@pkg/database';

import { resolveMailDeliveryView } from '../mail/mail-delivery';
import type { InviteRecord, MemberRecord, MemberRole, MemberStatus } from './members.types';

function normalizeEmail(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized === '' ? undefined : normalized;
}

function getPrimaryAccount(member: Loaded<Member, 'accounts'> | Member) {
  const accounts = member.accounts.getItems();
  const primaryAccount = [...accounts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  if (!primaryAccount) {
    throw new Error(`Primary account not found for member ${member.id}`);
  }

  return primaryAccount;
}

function getLatestLoginAt(member: Loaded<Member, 'accounts'> | Member): string | null {
  const latest = [...member.accounts.getItems()]
    .map((account) => account.lastLoginAt)
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return latest ? latest.toISOString() : null;
}

function getOrganizationRoleAssignment(member: Loaded<Member, 'organizationRoles'> | Member, organizationId: string): OrganizationRoleAssignment | undefined {
  return member.organizationRoles.getItems().find((organizationRole) => organizationRole.organization.id === organizationId);
}

function resolveMemberRole(roleCode: string): MemberRole {
  switch (roleCode) {
    case 'OWNER':
      return 'OWNER';
    case 'MANAGER':
      return 'MANAGER';
    case 'VIEWER':
      return 'VIEWER';
    default:
      throw new Error(`Unsupported member role code: ${roleCode}`);
  }
}

function resolveRoleCode(role: MemberRole): string {
  return role;
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase();
}

function getMemberName(member: Member): string {
  return member.name;
}

function getMemberEmail(member: Member): string {
  return getPrimaryAccount(member).email;
}

function getMemberEmailCandidates(member: Member): string[] {
  return [normalizeEmail(getPrimaryAccount(member).email)].filter((value): value is string => !!value);
}

function getInviteEmailCandidates(invite: MemberInvite): string[] {
  return [
    normalizeEmail(invite.email),
    normalizeEmail(invite.metadata.info.email),
  ].filter((value): value is string => !!value);
}

function hasSharedEmail(left: string[], right: string[]): boolean {
  const emailSet = new Set(left);
  return right.some((email) => emailSet.has(email));
}

export function buildCreatedByEmailLookup(members: Member[]): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const member of members) {
    for (const account of member.accounts.getItems()) {
      lookup.set(account.id, account.email);
    }
  }

  return lookup;
}

function getInvitedAt(member?: Member, invite?: MemberInvite): string {
  if (invite) {
    return invite.createdAt.toISOString();
  }

  if (member) {
    return member.createdAt.toISOString();
  }

  throw new Error('Invited at timestamp is required');
}

function getCreatedBy(
  member: Member | undefined,
  invite: MemberInvite | undefined,
  createdByEmailLookup: ReadonlyMap<string, string>,
): string | undefined {
  const creatorAccountId = invite?.createdBy ?? member?.createdBy;

  if (!creatorAccountId) {
    return undefined;
  }

  return createdByEmailLookup.get(creatorAccountId);
}

function getNote(member?: Member, invite?: MemberInvite): string | undefined {
  const inviteNote = invite?.metadata.info.note;
  if (inviteNote) {
    return inviteNote;
  }

  return undefined;
}

function getMemberStatus(member: Member): MemberStatus {
  return member.status === DbMemberStatus.ACTIVE ? 'ACTIVE' : 'INACTIVE';
}

function getInviteStatus(invite: MemberInvite): InviteRecord['inviteStatus'] {
  return invite.status as InviteRecord['inviteStatus'];
}

function getRoleCode(member: Member, organizationId: string, invite?: MemberInvite): string {
  const organizationRoleAssignment = getOrganizationRoleAssignment(member, organizationId);

  if (organizationRoleAssignment) {
    return organizationRoleAssignment.role.code;
  }

  if (invite) {
    return invite.role.code;
  }

  throw new Error(`Role assignment not found for member ${member.id} in organization ${organizationId}`);
}

export function resolveMemberRoleCode(role: MemberRole): string {
  return resolveRoleCode(role);
}

export function getLinkedInvite(invites: MemberInvite[], member: Member): MemberInvite | undefined {
  const memberEmails = getMemberEmailCandidates(member);

  return invites.find((invite) => hasSharedEmail(memberEmails, getInviteEmailCandidates(invite)));
}

export function getLinkedMember(members: Member[], invite: MemberInvite): Member | undefined {
  const inviteEmails = getInviteEmailCandidates(invite);

  return members.find((member) => hasSharedEmail(getMemberEmailCandidates(member), inviteEmails));
}

export function buildMemberRecord(
  member: Member,
  organization: Organization,
  requestedById: string,
  createdByEmailLookup: ReadonlyMap<string, string>,
  invite?: MemberInvite,
): MemberRecord {
  const roleCode = getRoleCode(member, organization.id, invite);
  const createdBy = getCreatedBy(member, invite, createdByEmailLookup);
  const mailDelivery = resolveMailDeliveryView(invite);

  return {
    id: member.id,
    name: getMemberName(member),
    email: getMemberEmail(member),
    role: resolveMemberRole(roleCode),
    status: getMemberStatus(member),
    lastLoginAt: getLatestLoginAt(member),
    invitedAt: getInvitedAt(member, invite),
    ...(createdBy !== undefined ? { createdBy } : {}),
    note: getNote(member, invite),
    ...(mailDelivery ?? {}),
    isMe: member.accounts.getItems().some((account) => account.id === requestedById),
  };
}

export function buildInviteRecord(
  invite: MemberInvite,
  organization: Organization,
  requestedById: string,
  createdByEmailLookup: ReadonlyMap<string, string>,
  member?: Member,
): InviteRecord {
  const linkedMember = member && hasSharedEmail(getMemberEmailCandidates(member), getInviteEmailCandidates(invite))
    ? member
    : undefined;
  const roleCode = linkedMember
    ? getRoleCode(linkedMember, organization.id, invite)
    : invite.role.code;
  const createdBy = getCreatedBy(linkedMember, invite, createdByEmailLookup);
  const mailDelivery = resolveMailDeliveryView(invite);

  let status: MemberStatus = 'INACTIVE';

  if (linkedMember?.status === DbMemberStatus.ACTIVE) {
    status = 'ACTIVE';
  }

  return {
    id: invite.id,
    name: invite.name,
    email: invite.email,
    role: resolveMemberRole(roleCode),
    status,
    inviteStatus: getInviteStatus(invite),
    expiresAt: invite.expiresAt.toISOString(),
    lastLoginAt: linkedMember ? getLatestLoginAt(linkedMember) : null,
    invitedAt: getInvitedAt(linkedMember, invite),
    ...(createdBy !== undefined ? { createdBy } : {}),
    note: getNote(linkedMember, invite),
    ...(mailDelivery ?? {}),
    isMe: !!linkedMember && linkedMember.accounts.getItems().some((account) => account.id === requestedById),
  };
}

export function filterMemberRecords(
  records: MemberRecord[],
  filters: {
    search?: string
    status?: MemberStatus
    role?: MemberRole
  },
): MemberRecord[] {
  const search = filters.search ? normalizeSearchValue(filters.search) : '';

  return records.filter((record) => {
    if (filters.status && record.status !== filters.status) return false;
    if (filters.role && record.role !== filters.role) return false;
    if (!search) return true;

    const haystack = [
      record.name,
      record.email,
      record.role,
      record.status,
      record.lastLoginAt ?? '',
      record.invitedAt,
      record.createdBy ?? '',
      record.note ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function filterInviteRecords(
  records: InviteRecord[],
  filters: {
    search?: string
    inviteStatus?: InviteRecord['inviteStatus']
    role?: MemberRole
  },
): InviteRecord[] {
  const search = filters.search ? normalizeSearchValue(filters.search) : '';

  return records.filter((record) => {
    if (filters.inviteStatus && record.inviteStatus !== filters.inviteStatus) return false;
    if (filters.role && record.role !== filters.role) return false;
    if (!search) return true;

    const haystack = [
      record.name,
      record.email,
      record.role,
      record.status,
      record.inviteStatus,
      record.lastLoginAt ?? '',
      record.invitedAt,
      record.createdBy ?? '',
      record.note ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortByRecentDate<T extends { invitedAt: string }>(records: T[]): T[] {
  return [...records].sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
}
