import { MAIL_DELIVERY_TIMEOUT_MS, type MemberInvite, MemberInviteMailDeliveryMetadata, MemberInviteMetadata } from '@pkg/database';

import type { MailDeliveryStatus, MailDeliveryStatusView } from './mail.types';

export function getMailDelivery(metadata: MemberInviteMetadata | undefined): MemberInviteMailDeliveryMetadata | undefined {
  return metadata?.mailDelivery;
}

export function markMailDeliverySent(
  metadata: MemberInviteMetadata | undefined,
  attemptId: string,
  sentAt: Date,
): MemberInviteMetadata {
  const delivery = getMailDelivery(metadata);

  if (!delivery || delivery.attemptId !== attemptId) {
    if (metadata) {
      return metadata;
    }

    return new MemberInviteMetadata();
  }

  const next = new MemberInviteMetadata(metadata);

  next.mailDelivery = new MemberInviteMailDeliveryMetadata({
    attemptId: delivery.attemptId,
    queuedAt: delivery.queuedAt,
    sentAt,
    failedAt: undefined,
  });

  return next;
}

export function markMailDeliveryFailed(
  metadata: MemberInviteMetadata | undefined,
  attemptId: string,
  failedAt: Date,
): MemberInviteMetadata {
  const delivery = getMailDelivery(metadata);

  if (!delivery || delivery.attemptId !== attemptId) {
    if (metadata) {
      return metadata;
    }

    return new MemberInviteMetadata();
  }

  const next = new MemberInviteMetadata(metadata);

  next.mailDelivery = new MemberInviteMailDeliveryMetadata({
    attemptId: delivery.attemptId,
    queuedAt: delivery.queuedAt,
    sentAt: undefined,
    failedAt,
  });

  return next;
}

export function resolveMailDeliveryStatusView(
  invite: MemberInvite | undefined,
): MailDeliveryStatusView | undefined {
  const delivery = getMailDelivery(invite?.metadata);

  if (!delivery) {
    return undefined;
  }

  const queuedAt = delivery.queuedAt.toISOString();
  const sentAt = delivery.sentAt?.toISOString();
  const failedAt = delivery.failedAt?.toISOString();

  if (invite?.isMailDeliveryTimeout) {
    const queuedAtTime = delivery.queuedAt.getTime();

    if (Number.isFinite(queuedAtTime)) {
      return {
        mailDeliveryStatus: 'FAILED',
        mailDeliveryQueuedAt: queuedAt,
        mailDeliveryFailedAt: new Date(queuedAtTime + MAIL_DELIVERY_TIMEOUT_MS).toISOString(),
      };
    }
  }

  let mailDeliveryStatus: MailDeliveryStatus = 'QUEUED';

  if (delivery.sentAt) {
    mailDeliveryStatus = 'SENT';
  }
  else if (invite?.isMailDeliveryFailed) {
    mailDeliveryStatus = 'FAILED';
  }

  return {
    mailDeliveryStatus,
    mailDeliveryQueuedAt: queuedAt,
    ...(sentAt ? { mailDeliverySentAt: sentAt } : {}),
    ...(failedAt ? { mailDeliveryFailedAt: failedAt } : {}),
  };
}
