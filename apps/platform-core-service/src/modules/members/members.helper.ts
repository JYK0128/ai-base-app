import { type Member, type MemberInvite, MemberInviteMetadata } from '@pkg/database';

import { isMailDeliveryFailed, isMailDeliveryQueued, isMailDeliveryTimeout } from '../mail/mail.helper';
import type { InviteRecord, MemberRecord } from './members.contract';

export function buildInviteRecord(invite: MemberInvite): InviteRecord {
  const metadata = invite.metadata ?? new MemberInviteMetadata();

  return {
    ...invite,
    status: invite.status,
    isPending: invite.isPending,
    isExpired: invite.isExpired,
    isCanceled: invite.isCanceled,
    isAccepted: invite.isAccepted,
    isRejected: invite.isRejected,
    isQueued: invite.isQueued,
    isDeleted: invite.isDeleted,
    isMailDeliveryFailed: isMailDeliveryFailed(invite.metadata),
    isMailDeliveryQueued: isMailDeliveryQueued(invite.metadata),
    isMailDeliveryTimeout: isMailDeliveryTimeout(invite.metadata),
    note: metadata.note,
    attemptId: metadata.attemptId,
    queuedAt: metadata.queuedAt.toISOString(),
    sentAt: metadata.sentAt?.toISOString(),
    failedAt: metadata.failedAt?.toISOString(),
    cancelAt: metadata.cancelAt?.toISOString(),
    acceptedAt: metadata.acceptedAt?.toISOString(),
    rejectedAt: metadata.rejectedAt?.toISOString(),
  };
}

export function buildMemberRecord(member: Member): MemberRecord {
  return {
    ...member,
    isDeleted: member.isDeleted,
    isActive: member.isActive,
  };
}
