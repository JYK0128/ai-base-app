import type { Member, MemberInvite, MemberInviteStatus, MemberStatus, OrganizationRole } from '@pkg/database';
import type { PickPrimitive } from '@pkg/shared';

export const MEMBERS_SERVICE_PATTERNS = {
  MEMBER: {
    LIST: 'members.get',
    GET: 'members.detail',
    UPDATE_ROLE: 'members.update-role',
    TOGGLE_STATUS: 'members.toggle-status',
  },
  INVITE: {
    LIST: 'members.invites.get',
    CREATE: 'members.invites.create',
    APPROVE: 'members.invites.approve',
    REJECT: 'members.invites.reject',
    RESEND: 'members.invites.resend',
    CANCEL: 'members.invites.cancel',
    REVIVE: 'members.invites.revive',
  },
} as const;

export type CreateInviteInput = { name: string, email: string, roleId: string, note?: string };
export type ResendInviteInput = Pick<MemberInvite, 'id'>;
export type CancelInviteInput = Pick<MemberInvite, 'id'>;
export type ReviveInviteInput = Pick<MemberInvite, 'id'>;
export type GetInvitesInput = {
  search?: string
  inviteStatus?: MemberInviteStatus
  roleId?: string
};

export type InviteRecord = Prettify<
  PickPrimitive<MemberInvite>
  & {
    status: MemberInviteStatus
    note?: string
    attemptId: string
    queuedAt: string
    sentAt?: string | null
    failedAt?: string | null
    cancelAt?: string | null
    acceptedAt?: string | null
    rejectedAt?: string | null
    isPending: boolean
    isExpired: boolean
    isCanceled: boolean
    isAccepted: boolean
    isRejected: boolean
    isQueued: boolean
    isMailDeliveryFailed: boolean
    isMailDeliveryQueued: boolean
    isMailDeliveryTimeout: boolean
  }
>;
export type InviteIdRecord = Prettify<
  PickPrimitive<MemberInvite, 'id'>
>;

export type UpdateMemberStatusInput = Pick<Member, 'id' | 'status'>;
export type UpdateMemberRoleInput = Pick<Member, 'id'> & {
  roleId: OrganizationRole['id']
};
export type GetMemberInput = Pick<Member, 'id'>;
export type GetMembersInput = {
  search?: string
  status?: MemberStatus
  roleId?: OrganizationRole['id']
};

export type MemberRecord = Prettify<
  PickPrimitive<Member>
>;
export type MemberIdRecord = Pick<Member, 'id'>;
