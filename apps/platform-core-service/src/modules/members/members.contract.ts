import type { Member, MemberInvite, MemberInviteInfoMetadata, MemberInviteMailDeliveryMetadata, MemberInviteStatus, MemberInviteTimelineMetadata, OrganizationRole } from '@pkg/database';
import type { PickPrimitive, Plain } from '@pkg/shared';

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
  & Plain<MemberInviteInfoMetadata>
  & Plain<MemberInviteMailDeliveryMetadata>
  & Plain<MemberInviteTimelineMetadata>
>;

export type InviteIdRecord = Prettify<
  PickPrimitive<MemberInvite, 'id'>
>;

export type UpdateMemberStatusInput = Pick<Member, 'id' | 'status'>;
export type UpdateMemberRoleInput = Pick<Member, 'id'> & {
  roleId: OrganizationRole['id']
};

export type MemberIdRecord = Pick<Member, 'id'>;
