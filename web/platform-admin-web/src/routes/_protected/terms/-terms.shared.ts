import { type GetTermsDocumentResponseDto,
         GetTermsDocumentResponseDtoStatus,
         type GetTermsDocumentVersionResponseDto,
         GetTermsDocumentVersionResponseDtoStatus } from '@/api/generated/model';

export type ExtendedTermsDocumentResponseDto = GetTermsDocumentResponseDto;
export type ExtendedTermsVersionResponseDto = GetTermsDocumentVersionResponseDto;

export type TermsDocumentScope = 'platform' | 'organization';
export type TermsDocumentLifecycle = 'ACTIVE' | 'DRAFT' | 'TERMINATED' | 'SCHEDULED_TERMINATION';
export type VersionComputedStatus = 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'HISTORICAL';

export type VersionStatusPresentation = {
  description: string
  label: string
  tone: VersionComputedStatus
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function formatDateTime(dateString?: string | null): string {
  const date = toDate(dateString);
  if (!date) return '-';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDatetimeLocalValue(dateString?: string | null): string {
  const date = toDate(dateString);
  if (!date) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toIsoDateString(dateString?: string | null): string {
  const date = toDate(dateString);
  return date ? date.toISOString() : new Date().toISOString();
}

function getPublishedVersionTimeline(allVersions: ExtendedTermsVersionResponseDto[]) {
  return allVersions
    .filter((version) => version.status === GetTermsDocumentVersionResponseDtoStatus.PUBLISHED)
    .map((version) => ({
      effectiveAt: toDate(version.effectiveAt),
      version,
    }))
    .filter(
      (entry): entry is {
        effectiveAt: Date
        version: ExtendedTermsVersionResponseDto
      } => !!entry.effectiveAt,
    )
    .sort((left, right) => left.effectiveAt.getTime() - right.effectiveAt.getTime());
}

export function scopeLabel(organization?: string | null): string {
  return organization ? '조직' : '플랫폼';
}

export function getDocumentLifecycle(doc?: ExtendedTermsDocumentResponseDto): TermsDocumentLifecycle {
  if (!doc) return 'DRAFT';

  if (doc.status === GetTermsDocumentResponseDtoStatus.DRAFT) {
    return 'DRAFT';
  }

  const terminatedAt = toDate(doc.terminatedAt);
  if (!terminatedAt) {
    return 'ACTIVE';
  }

  return terminatedAt <= new Date() ? 'TERMINATED' : 'SCHEDULED_TERMINATION';
}

export function isDocumentCurrentlyTerminated(doc?: ExtendedTermsDocumentResponseDto): boolean {
  return getDocumentLifecycle(doc) === 'TERMINATED';
}

export function isDocumentScheduledForTermination(doc?: ExtendedTermsDocumentResponseDto): boolean {
  return getDocumentLifecycle(doc) === 'SCHEDULED_TERMINATION';
}

export function getCurrentActivePublishedVersion(
  allVersions: ExtendedTermsVersionResponseDto[],
): ExtendedTermsVersionResponseDto | undefined {
  const publishedVersions = getPublishedVersionTimeline(allVersions);

  const now = new Date();
  let currentVersion: ExtendedTermsVersionResponseDto | undefined;
  for (const entry of publishedVersions) {
    if (entry.effectiveAt > now) {
      break;
    }

    currentVersion = entry.version;
  }

  return currentVersion;
}

export function getVersionEffectiveTo(
  version: ExtendedTermsVersionResponseDto,
  allVersions: ExtendedTermsVersionResponseDto[],
): string | null {
  const timeline = getPublishedVersionTimeline(allVersions);
  const currentIndex = timeline.findIndex((entry) => entry.version.id === version.id);

  if (currentIndex < 0) {
    return null;
  }

  return timeline[currentIndex + 1]?.effectiveAt.toISOString() ?? null;
}

export function getVersionStatusPresentation(
  version: ExtendedTermsVersionResponseDto,
  allVersions: ExtendedTermsVersionResponseDto[],
): VersionStatusPresentation {
  if (version.status === GetTermsDocumentVersionResponseDtoStatus.DRAFT) {
    return {
      description: '아직 게시되지 않은 초안입니다.',
      label: '임시저장',
      tone: 'DRAFT',
    };
  }

  const now = new Date();
  const activeVersion = getCurrentActivePublishedVersion(allVersions);
  const effectiveDate = formatDateTime(version.effectiveAt);
  const effectiveAt = toDate(version.effectiveAt);

  if (activeVersion && version.id === activeVersion.id) {
    return {
      description: `현재 효력이 적용 중입니다. (${effectiveDate})`,
      label: '현재 효력중',
      tone: 'ACTIVE',
    };
  }

  if (effectiveAt && effectiveAt > now) {
    return {
      description: `예약 발효 예정입니다. (${effectiveDate})`,
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

export function isEditableVersion(version?: ExtendedTermsVersionResponseDto): boolean {
  if (!version) return false;

  if (version.status === GetTermsDocumentVersionResponseDtoStatus.DRAFT) {
    return true;
  }

  if (version.status !== GetTermsDocumentVersionResponseDtoStatus.PUBLISHED) {
    return false;
  }

  const effectiveAt = toDate(version.effectiveAt);
  if (!effectiveAt) return false;

  return effectiveAt > new Date();
}

export function defaultTermsVersionEffectiveAtInput(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}
