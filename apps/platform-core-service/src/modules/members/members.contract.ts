import type { MemberInvite, MemberInviteInfoMetadata, MemberInviteMailDeliveryMetadata, MemberInviteTimelineMetadata } from '@pkg/database';
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

export type CancelInviteInput = Pick<MemberInvite, 'id'>;

export type InviteRecord = Prettify<
  PickPrimitive<MemberInvite>
  & Plain<MemberInviteInfoMetadata>
  & Plain<MemberInviteMailDeliveryMetadata>
  & Plain<MemberInviteTimelineMetadata>
>;

export type InviteIdRecord = Prettify<
  PickPrimitive<MemberInvite, 'id'>
>;
