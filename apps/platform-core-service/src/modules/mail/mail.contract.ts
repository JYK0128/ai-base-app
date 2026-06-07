export const MAIL_EVENT_PATTERNS = {
  INVITE: {
    SEND: 'mail.invite.send',
  },
} as const;

export interface SendInviteEmailPayload {
  inviteId: string
  attemptId: string
  email: string
  organizationName: string
  inviterName: string
  token: string
}
