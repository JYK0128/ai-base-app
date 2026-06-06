import type { MailDeliveryStatus } from '../mail/mail-delivery';

export type MemberRole = 'OWNER' | 'MANAGER' | 'VIEWER';

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export type InviteStatus = 'PENDING' | 'CANCELED' | 'ACCEPTED' | 'REJECTED';

export interface MemberRecord {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  lastLoginAt: string | null
  invitedAt: string
  createdBy?: string
  note?: string
  isMe?: boolean
  mailDeliveryStatus?: MailDeliveryStatus
  mailDeliveryQueuedAt?: string
  mailDeliverySentAt?: string
  mailDeliveryFailedAt?: string
}

export interface InviteRecord extends MemberRecord {
  inviteStatus: InviteStatus
  expiresAt: string
}

export interface MemberMutationResult {
  id: string
}
