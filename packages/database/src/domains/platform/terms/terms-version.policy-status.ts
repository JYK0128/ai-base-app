import { TermsVersionStatus } from './terms-version.constants';

export function isTermsVersionDraft(status: TermsVersionStatus | undefined): boolean {
  return status === TermsVersionStatus.DRAFT;
}

export function isTermsVersionPublished(status: TermsVersionStatus | undefined): boolean {
  return status === TermsVersionStatus.PUBLISHED;
}

export function isTermsVersionCurrentlyEffective(
  status: TermsVersionStatus | undefined,
  effectiveAt: Date | undefined,
  now: number = Date.now(),
): boolean {
  return status === TermsVersionStatus.PUBLISHED && !!effectiveAt && effectiveAt.getTime() <= now;
}

export function isTermsVersionScheduledForActivation(
  status: TermsVersionStatus | undefined,
  effectiveAt: Date | undefined,
  now: number = Date.now(),
): boolean {
  return status === TermsVersionStatus.PUBLISHED && !!effectiveAt && effectiveAt.getTime() > now;
}
