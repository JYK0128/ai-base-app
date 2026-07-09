export const MAIL_EVENT_PATTERNS = {
  INVITE: {
    SEND: 'mail.invite.send',
    DELIVERY_RESULT: 'mail.invite.delivery-result',
  },
} as const;

export const MAIL_QUEUE_NAMES = {
  INVITE_SEND: 'mail_invite_send_queue',
  INVITE_DELIVERY_RESULT: 'mail_invite_delivery_result_queue',
} as const;

export interface InviteEmailPayload {
  inviteId: string
  email: string
  organizationName: string
  inviterName: string
  token: string
}

export type InviteEmailDeliveryResultStatus = 'SENT' | 'FAILED';

export interface InviteEmailDeliveryResultPayload {
  inviteId: string
  status: InviteEmailDeliveryResultStatus
  occurredAt: string
  errorMessage?: string
}
