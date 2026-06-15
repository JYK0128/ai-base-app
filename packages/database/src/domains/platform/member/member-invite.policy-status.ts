import { MemberInviteStatus } from './member.constants';
import type { MemberInviteMetadata } from './member-invite.entity';

export function getMemberInviteStatus(
  metadata: Pick<MemberInviteMetadata, 'acceptedAt' | 'rejectedAt' | 'cancelAt' | 'expiredAt' | 'sentAt'> | undefined,
): MemberInviteStatus {
  if (metadata?.acceptedAt) {
    return MemberInviteStatus.ACCEPTED;
  }

  if (metadata?.rejectedAt) {
    return MemberInviteStatus.REJECTED;
  }

  if (metadata?.cancelAt) {
    return MemberInviteStatus.CANCELED;
  }

  if (metadata?.expiredAt) {
    return MemberInviteStatus.EXPIRED;
  }

  if (metadata?.sentAt) {
    return MemberInviteStatus.PENDING;
  }

  return MemberInviteStatus.QUEUED;
}
