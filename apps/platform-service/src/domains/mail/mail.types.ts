export const MAIL_DELIVERY_STATUS_VALUES = ['QUEUED', 'SENT', 'FAILED'] as const;
export type MailDeliveryStatus = (typeof MAIL_DELIVERY_STATUS_VALUES)[number];

export interface SendInviteEmailFailureContext {
  inviteId: string
  attemptId: string
  email: string
}
