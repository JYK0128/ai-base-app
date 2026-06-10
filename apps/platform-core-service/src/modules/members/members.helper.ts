import { type MemberInvite } from '@pkg/database';

import type { InviteRecord } from './members.contract';

export function buildInviteRecord(invite: MemberInvite): InviteRecord {
  return {
    ...invite,
    isPending: invite.isPending,
    isCanceled: invite.isCanceled,
    isAccepted: invite.isAccepted,
    isRejected: invite.isRejected,
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
