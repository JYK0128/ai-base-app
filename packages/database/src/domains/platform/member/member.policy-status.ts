import { MemberStatus } from './member.constants';

export function isMemberActive(status: MemberStatus | undefined): boolean {
  return status === MemberStatus.ACTIVE;
}
