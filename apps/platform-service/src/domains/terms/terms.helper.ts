import type { TermsDocument, TermsVersion } from '@pkg/database';

import { TermsDocumentResponseDto } from './queries/get-active-terms.response.dto';
import { TermsDocumentDetailResponseDto, TermsVersionResponseDto } from './queries/get-terms-document.response.dto';

export function getCurrentPublishedVersion(
  versions: TermsVersion[],
): TermsVersion | undefined {
  return [...versions]
    .filter((version) => version.isCurrentlyEffective)
    .sort((left, right) => right.effectiveAt.getTime() - left.effectiveAt.getTime())[0];
}

export function mapTermsDocumentResponse(document: TermsDocument): TermsDocumentResponseDto {
  return new TermsDocumentResponseDto(document);
}

export function mapTermsVersionResponse(version: TermsVersion): TermsVersionResponseDto {
  return new TermsVersionResponseDto(version);
}

export function mapTermsDocumentDetailResponse(
  document: TermsDocument,
  versions: TermsVersion[],
): TermsDocumentDetailResponseDto {
  const currentVersion = getCurrentPublishedVersion(versions);

  return new TermsDocumentDetailResponseDto(
    mapTermsDocumentResponse(document),
    versions.map(mapTermsVersionResponse),
    currentVersion ? mapTermsVersionResponse(currentVersion) : null,
  );
}
