import { type GetTermDocumentDetailResponseDto, type GetTermDocumentItem, GetTermDocumentItemStatus, type GetTermDocumentVersionItem, GetTermDocumentVersionItemStatus } from '@/api/generated/model';

import { formatDateTime } from './terms-date.helper';

export type TermsDocumentScope = 'platform' | 'organization';

export type TermsDocumentLifecycle = 'ACTIVE' | 'DRAFT' | 'TERMINATED' | 'SCHEDULED_TERMINATION';

export type VersionComputedStatus = 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'HISTORICAL';

export interface ManagedTermsVersion extends GetTermDocumentVersionItem {
  readonly summary?: string
  readonly reason?: string
}

export interface ManagedTermsDocument {
  readonly origin: 'local' | 'remote'
  readonly scope: TermsDocumentScope
  readonly document: GetTermDocumentItem
  readonly versions: ManagedTermsVersion[]
}

export interface ManagedTermsCollections {
  platform: ManagedTermsDocument[]
  organization: ManagedTermsDocument[]
}

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

function getPublishedVersionTimeline(allVersions: ManagedTermsVersion[]) {
  return allVersions
    .filter((version) => version.status === GetTermDocumentVersionItemStatus.PUBLISHED)
    .map((version) => ({
      effectiveAt: toDate(version.effectiveAt),
      version,
    }))
    .filter(
      (entry): entry is {
        effectiveAt: Date
        version: ManagedTermsVersion
      } => !!entry.effectiveAt,
    )
    .sort((left, right) => left.effectiveAt.getTime() - right.effectiveAt.getTime());
}

export function getDocumentScope(document?: GetTermDocumentItem | null): TermsDocumentScope {
  return document?.organizationId ? 'organization' : 'platform';
}

export function getDocumentScopeLabel(scope: TermsDocumentScope): string {
  return scope === 'organization' ? '조직' : '플랫폼';
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

export function documentStatusTone(status: TermsDocumentLifecycle) {
  switch (status) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'TERMINATED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'SCHEDULED_TERMINATION':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export function createManagedDocument(document: GetTermDocumentItem): ManagedTermsDocument {
  return {
    origin: 'remote',
    scope: getDocumentScope(document),
    document: {
      ...document,
      terminatedAt: document.terminatedAt ?? null,
    },
    versions: [],
  };
}

export function mergeDocumentDetail(record: ManagedTermsDocument, detail: GetTermDocumentDetailResponseDto): ManagedTermsDocument {
  return {
    origin: record.origin,
    scope: getDocumentScope(detail.document),
    document: {
      ...record.document,
      ...detail.document,
      terminatedAt: detail.document.terminatedAt ?? null,
    },
    versions: detail.versions.map((version) => ({
      ...version,
      summary: (version as GetTermDocumentVersionItem & { summary?: string }).summary
        ?? record.versions.find((item) => item.id === version.id)?.summary,
      reason: (version as GetTermDocumentVersionItem & { reason?: string }).reason
        ?? record.versions.find((item) => item.id === version.id)?.reason,
    })),
  };
}

export function normalizeDocumentCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').replace(/-+/g, '_').toUpperCase();
}

export function buildLocalChecksum(label: string, content: string, effectiveAt: string) {
  const source = `${label}|${content}|${effectiveAt}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = Math.imul(31, hash) + source.charCodeAt(index);
    hash |= 0;
  }

  return `local-${Math.abs(hash).toString(36)}`;
}

export function sortVersionsByEffectiveAt(versions: ManagedTermsVersion[]): ManagedTermsVersion[] {
  return [...versions].sort((left, right) => {
    const leftEffective = toDate(left.effectiveAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightEffective = toDate(right.effectiveAt)?.getTime() ?? Number.POSITIVE_INFINITY;

    return leftEffective - rightEffective;
  });
}

export function getCurrentActivePublishedVersion(
  allVersions: ManagedTermsVersion[],
): ManagedTermsVersion | undefined {
  const publishedVersions = getPublishedVersionTimeline(allVersions);

  const now = new Date();
  let currentVersion: ManagedTermsVersion | undefined;
  for (const entry of publishedVersions) {
    if (entry.effectiveAt > now) {
      break;
    }

    currentVersion = entry.version;
  }

  return currentVersion;
}

export function getVersionEffectiveTo(
  version: ManagedTermsVersion,
  allVersions: ManagedTermsVersion[],
): string | null {
  const timeline = getPublishedVersionTimeline(allVersions);
  const currentIndex = timeline.findIndex((entry) => entry.version.id === version.id);

  if (currentIndex < 0) {
    return null;
  }

  return timeline[currentIndex + 1]?.effectiveAt?.toISOString() ?? null;
}

export function getVersionStatusPresentation(
  version: ManagedTermsVersion,
  allVersions: ManagedTermsVersion[],
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
  version?: ManagedTermsVersion,
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
