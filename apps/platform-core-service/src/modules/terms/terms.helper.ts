import { TermsConsent, TermsDocument, TermsDocumentStatus, TermsVersion, TermsVersionStatus } from '@pkg/database';

export type TermsDocumentResponseStatus = TermsDocumentStatus | 'DEPRECATED';

export type TermsDocumentResponse = {
  id: string
  organizationId?: string | null
  code: string
  title: string
  required: boolean
  status: TermsDocumentResponseStatus
  deprecatedAt?: string | null
};

export type TermsVersionResponse = {
  id: string
  versionLabel: string
  content: string
  checksum: string
  status: TermsVersionStatus
  effectiveAt: string
};

export type TermsDocumentDetailResponse = {
  document: TermsDocumentResponse
  versions: TermsVersionResponse[]
  currentVersion: TermsVersionResponse | null
};

export type TermsConsentResponse = {
  id: string
  agreed: boolean
  agreedAt: string
};

function toIsoString(date?: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function getCurrentPublishedVersion(
  versions: TermsVersion[],
): TermsVersion | undefined {
  return [...versions]
    .filter((version) => version.isCurrentlyEffective)
    .sort((left, right) => right.effectiveAt.getTime() - left.effectiveAt.getTime())[0];
}

export function isDocumentCurrentlyDeprecated(document: TermsDocument): boolean {
  return document.isDeprecated;
}

export function isDocumentScheduledForDeprecation(document: TermsDocument): boolean {
  return document.isScheduledForDeprecation;
}

export function mapTermsVersionResponse(version: TermsVersion): TermsVersionResponse {
  return {
    id: version.id,
    versionLabel: version.label,
    content: version.content,
    checksum: version.checksum,
    status: version.status,
    effectiveAt: version.effectiveAt.toISOString(),
  };
}

export function mapTermsDocumentResponse(document: TermsDocument): TermsDocumentResponse {
  return {
    id: document.id,
    organizationId: document.organization ? document.organization.id : null,
    code: document.code,
    title: document.title,
    required: document.required,
    status: document.status,
    deprecatedAt: toIsoString(document.deprecatedAt),
  };
}

export function mapTermsDocumentDetailResponse(document: TermsDocument, versions: TermsVersion[]): TermsDocumentDetailResponse {
  const currentVersion = getCurrentPublishedVersion(versions);

  return {
    document: mapTermsDocumentResponse(document),
    versions: versions.map(mapTermsVersionResponse),
    currentVersion: currentVersion ? mapTermsVersionResponse(currentVersion) : null,
  };
}

export function mapTermsConsentResponse(consent: TermsConsent): TermsConsentResponse {
  return {
    id: consent.id,
    agreed: consent.agreed,
    agreedAt: consent.createdAt.toISOString(),
  };
}
