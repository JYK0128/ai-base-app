import type { TermsDocument, TermsVersion } from '@pkg/database';

import { TermsDocumentResponseDto } from './queries/get-active-terms.response.dto';

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
