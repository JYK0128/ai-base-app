import type { Member, MemberAccount, MemberInvite, Organization } from '@pkg/database';

import type { MailDeliveryStatus } from '../mail/mail.types';

export type MemberRole = 'OWNER' | 'MANAGER' | 'VIEWER';

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export type InviteStatus = 'PENDING' | 'CANCELED' | 'ACCEPTED' | 'REJECTED';

export interface MemberOutput extends Pick<Member, 'id' | 'name'> {
  email: string
  role: MemberRole
  status: MemberStatus
  lastLoginAt: string | null
  invitedAt: string
  createdBy?: string
  note?: string
  isMe?: boolean
  mailDeliveryStatus?: MailDeliveryStatus
  mailDeliveryQueuedAt?: string
  mailDeliverySentAt?: string
  mailDeliveryFailedAt?: string
}

export interface InviteOutput extends MemberOutput {
  inviteStatus: InviteStatus
  expiresAt: string
}

export interface InviteOutputResult {
  invite: MemberInvite
  organization: Organization
  inviter: MemberAccount
}

export type GetMemberInput = Pick<Member, 'id'>;

export type GetMembersInput = {
  search?: string
  status?: MemberStatus
  role?: MemberRole
};
