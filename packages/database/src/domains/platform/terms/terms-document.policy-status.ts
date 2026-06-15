import { TermsDocumentStatus } from './terms-document.constants';
import type { TermsDocumentMetadata } from './terms-document.entity';

export function getTermsDocumentStatus(
  metadata: Pick<TermsDocumentMetadata, 'publishedAt' | 'terminatedAt'> | undefined,
): TermsDocumentStatus {
  if (!metadata?.publishedAt) {
    return TermsDocumentStatus.DRAFT;
  }

  if (metadata.terminatedAt && metadata.terminatedAt.getTime() <= Date.now()) {
    return TermsDocumentStatus.TERMINATED;
  }

  return TermsDocumentStatus.PUBLISHED;
}

export function isTermsDocumentDraft(status: TermsDocumentStatus | undefined): boolean {
  return status === TermsDocumentStatus.DRAFT;
}

export function isTermsDocumentPublished(status: TermsDocumentStatus | undefined): boolean {
  return status === TermsDocumentStatus.PUBLISHED;
}

export function isTermsDocumentTerminated(status: TermsDocumentStatus | undefined): boolean {
  return status === TermsDocumentStatus.TERMINATED;
}

export function isTermsDocumentScheduledForTermination(
  metadata: Pick<TermsDocumentMetadata, 'publishedAt' | 'terminatedAt'> | undefined,
): boolean {
  return !!metadata?.publishedAt && !!metadata.terminatedAt && metadata.terminatedAt.getTime() > Date.now();
}
