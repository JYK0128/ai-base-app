import { MAIL_DELIVERY_TIMEOUT_MS, type MemberInvite, MemberInviteMailDeliveryMetadata, MemberInviteMetadata } from '@pkg/database';

export const MAIL_DELIVERY_STATUS_VALUES = ['QUEUED', 'SENT', 'FAILED'] as const;
export type MailDeliveryStatus = (typeof MAIL_DELIVERY_STATUS_VALUES)[number];

export interface MailDeliveryView {
  mailDeliveryStatus?: MailDeliveryStatus
  mailDeliveryQueuedAt?: string
  mailDeliverySentAt?: string
  mailDeliveryFailedAt?: string
}

export function getMailDelivery(metadata: MemberInviteMetadata | undefined): MemberInviteMailDeliveryMetadata | undefined {
  return metadata?.mailDelivery;
}

function toIsoString(value: Date | undefined): string | undefined {
  return value?.toISOString();
}

export function markMailDeliverySent(
  metadata: MemberInviteMetadata | undefined,
  attemptId: string,
  sentAt: Date,
): MemberInviteMetadata {
  const delivery = getMailDelivery(metadata);

  if (!delivery || delivery.attemptId !== attemptId) {
    return metadata ?? new MemberInviteMetadata();
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
    return metadata ?? new MemberInviteMetadata();
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

export function resolveMailDeliveryView(
  invite: MemberInvite | undefined,
): MailDeliveryView | undefined {
  const delivery = getMailDelivery(invite?.metadata);

  if (!delivery) {
    return undefined;
  }

  const queuedAt = toIsoString(delivery.queuedAt);
  const sentAt = toIsoString(delivery.sentAt);
  const failedAt = toIsoString(delivery.failedAt);

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
