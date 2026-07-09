import type { GetTermDocumentItem, GetTermDocumentVersionItem } from '@/api/generated/model';
import { GetTermDocumentItemStatus, GetTermDocumentVersionItemStatus } from '@/api/generated/model';

import { formatDateTime } from './terms-date.helper';

export type TermsDocumentScope = 'platform' | 'organization';
export type TermsDocumentLifecycle = 'ACTIVE' | 'DRAFT' | 'TERMINATED' | 'SCHEDULED_TERMINATION';
export type VersionComputedStatus = 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'HISTORICAL';

export type VersionStatusPresentation = {
  description: string
  label: string
  tone: VersionComputedStatus
};

function toDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getPublishedVersionTimeline(allVersions: GetTermDocumentVersionItem[]) {
  return allVersions
    .filter((version) => version.status === GetTermDocumentVersionItemStatus.PUBLISHED)
    .map((version) => ({
      effectiveAt: toDate(version.effectiveAt),
      version,
    }))
    .filter(
      (entry): entry is {
        effectiveAt: Date
        version: GetTermDocumentVersionItem
      } => !!entry.effectiveAt,
    )
    .sort((left, right) => left.effectiveAt.getTime() - right.effectiveAt.getTime());
}

export function scopeLabel(organization?: string | null): string {
  return organization ? '조직' : '플랫폼';
}

export function getDocumentLifecycle(doc?: GetTermDocumentItem): TermsDocumentLifecycle {
  if (!doc) return 'DRAFT';

  if (doc.status === GetTermDocumentItemStatus.DRAFT) {
    return 'DRAFT';
  }

  const terminatedAt = toDate(doc.terminatedAt);
  if (!terminatedAt) {
    return 'ACTIVE';
  }

  return terminatedAt <= new Date() ? 'TERMINATED' : 'SCHEDULED_TERMINATION';
}

export function isDocumentCurrentlyTerminated(doc?: GetTermDocumentItem): boolean {
  return getDocumentLifecycle(doc) === 'TERMINATED';
}

export function isDocumentScheduledForTermination(doc?: GetTermDocumentItem): boolean {
  return getDocumentLifecycle(doc) === 'SCHEDULED_TERMINATION';
}

export function getCurrentActivePublishedVersion(
  allVersions: GetTermDocumentVersionItem[],
): GetTermDocumentVersionItem | undefined {
  const publishedVersions = getPublishedVersionTimeline(allVersions);

  const now = new Date();
  let currentVersion: GetTermDocumentVersionItem | undefined;
  for (const entry of publishedVersions) {
    if (entry.effectiveAt > now) {
      break;
    }

    currentVersion = entry.version;
  }

  return currentVersion;
}

export function getVersionEffectiveTo(
  version: GetTermDocumentVersionItem,
  allVersions: GetTermDocumentVersionItem[],
): string | null {
  const timeline = getPublishedVersionTimeline(allVersions);
  const currentIndex = timeline.findIndex((entry) => entry.version.id === version.id);

  if (currentIndex < 0) {
    return null;
  }

  return timeline[currentIndex + 1]?.effectiveAt?.toISOString() ?? null;
}

export function getVersionStatusPresentation(
  version: GetTermDocumentVersionItem,
  allVersions: GetTermDocumentVersionItem[],
): VersionStatusPresentation {
  if (version.status === GetTermDocumentVersionItemStatus.DRAFT) {
    return {
      description: '아직 게시되지 않은 초안입니다.',
      label: '임시저장',
      tone: 'DRAFT',
    };
  }

  const now = new Date();
  const activeVersion = getCurrentActivePublishedVersion(allVersions);
  const effectiveDate = version.effectiveAt ? new Date(version.effectiveAt) : null;

  if (activeVersion && version.id === activeVersion.id) {
    return {
      description: `현재 효력이 적용 중입니다. (${version.effectiveAt ? formatDateTime(version.effectiveAt) : '-'})`,
      label: '현재 효력중',
      tone: 'ACTIVE',
    };
  }

  if (effectiveDate && effectiveDate > now) {
    return {
      description: `예약 발효 예정입니다. (${formatDateTime(version.effectiveAt)})`,
      label: '예약 발효',
      tone: 'SCHEDULED',
    };
  }

  return {
    description: '현재 효력이 종료된 과거 버전입니다.',
    label: '이전 버전',
    tone: 'HISTORICAL',
  };
}

export function isEditableVersion(
  version?: GetTermDocumentVersionItem,
  document?: GetTermDocumentItem | null,
): boolean {
  if (!version) return false;

  if (document && getDocumentLifecycle(document) === 'TERMINATED') {
    return false;
  }

  if (version.status === GetTermDocumentVersionItemStatus.DRAFT) {
    return true;
  }

  if (version.status !== GetTermDocumentVersionItemStatus.PUBLISHED) {
    return false;
  }

  const effectiveAt = version.effectiveAt ? toDate(version.effectiveAt) : null;
  if (!effectiveAt) return false;

  return effectiveAt > new Date();
}
