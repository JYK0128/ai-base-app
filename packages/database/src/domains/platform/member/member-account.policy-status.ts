import { AccountStatus } from './member.constants';

export function isMemberAccountPasswordExpired(passwordExpiresAt?: Date | null, now: number = Date.now()): boolean {
  return !passwordExpiresAt || passwordExpiresAt.getTime() < now;
}

export function isMemberAccountActive(status: AccountStatus | undefined): boolean {
  return status === AccountStatus.ACTIVE;
}

export function isMemberAccountDormant(lastLoginAt?: Date | null, now: number = Date.now()): boolean {
  if (!lastLoginAt) {
    return false;
  }

  const dormancyPeriodMs = 90 * 24 * 60 * 60 * 1000;
  return now - lastLoginAt.getTime() > dormancyPeriodMs;
}
