import { type Member, type MemberInvite } from '@pkg/database';

import type { InviteRecord, MemberRecord } from './members.contract';

export function buildInviteRecord(invite: MemberInvite): InviteRecord {
  return {
    ...invite,
    isPending: invite.isPending,
    isCanceled: invite.isCanceled,
    isAccepted: invite.isAccepted,
    isRejected: invite.isRejected,
    isDeleted: invite.isDeleted,
    isMailDeliveryFailed: invite.isMailDeliveryFailed,
    isMailDeliveryQueued: invite.isMailDeliveryQueued,
    isMailDeliveryTimeout: invite.isMailDeliveryTimeout,
    ...invite.metadata.info,
    ...invite.metadata.mailDelivery,
    ...invite.metadata.timeline,
    attemptId: invite.metadata.mailDelivery.attemptId,
    queuedAt: invite.metadata.mailDelivery.queuedAt.toISOString(),
    sentAt: invite.metadata.mailDelivery.sentAt?.toISOString(),
    failedAt: invite.metadata.mailDelivery.failedAt?.toISOString(),
    resentAt: invite.metadata.timeline.resentAt?.toISOString(),
    cancelAt: invite.metadata.timeline.cancelAt?.toISOString(),
    revivedAt: invite.metadata.timeline.revivedAt?.toISOString(),
  };
}

export function buildMemberRecord(member: Member): MemberRecord {
  return {
    ...member,
    isDeleted: member.isDeleted,
    isActive: member.isActive,
  };
}
