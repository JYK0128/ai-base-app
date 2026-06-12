import { type MemberInvite, MemberInviteMetadata } from '@pkg/database';

import type { MailDeliveryStatus, MailDeliveryStatusView } from './mail.types';

export const MAIL_DELIVERY_TIMEOUT_MS = 15 * 60 * 1000;

type MailDeliveryMetadata = {
  attemptId: string
  queuedAt: Date
  sentAt?: Date | null
  failedAt?: Date | null
  expiredAt?: Date | null
};

export function getMailDelivery(metadata: MemberInviteMetadata | undefined): MailDeliveryMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  return {
    attemptId: metadata.attemptId,
    queuedAt: metadata.queuedAt,
    sentAt: metadata.sentAt,
    failedAt: metadata.failedAt,
    expiredAt: metadata.expiredAt,
  };
}

export function isMailDeliveryQueued(metadata: MemberInviteMetadata | undefined): boolean {
  const delivery = getMailDelivery(metadata);

  if (!delivery) {
    return false;
  }

  return !delivery.sentAt && !delivery.failedAt && !isMailDeliveryTimeout(metadata);
}

export function isMailDeliveryTimeout(metadata: MemberInviteMetadata | undefined): boolean {
  const delivery = getMailDelivery(metadata);

  if (!delivery || delivery.sentAt || delivery.failedAt) {
    return false;
  }

  if (delivery.expiredAt) {
    return delivery.expiredAt.getTime() <= Date.now();
  }

  const queuedAtTime = delivery.queuedAt.getTime();
  return Number.isFinite(queuedAtTime) && queuedAtTime + MAIL_DELIVERY_TIMEOUT_MS <= Date.now();
}

export function isMailDeliveryFailed(metadata: MemberInviteMetadata | undefined): boolean {
  const delivery = getMailDelivery(metadata);

  if (!delivery) {
    return false;
  }

  return !!delivery.failedAt || isMailDeliveryTimeout(metadata);
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
  next.sentAt = sentAt;
  next.failedAt = undefined;

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
  next.sentAt = undefined;
  next.failedAt = failedAt;

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

  if (isMailDeliveryTimeout(invite?.metadata)) {
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
  else if (isMailDeliveryFailed(invite?.metadata)) {
    mailDeliveryStatus = 'FAILED';
  }

  return {
    mailDeliveryStatus,
    mailDeliveryQueuedAt: queuedAt,
    ...(sentAt ? { mailDeliverySentAt: sentAt } : {}),
    ...(failedAt ? { mailDeliveryFailedAt: failedAt } : {}),
  };
}
