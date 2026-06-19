import type { EntityDataPropValue, FilterQuery } from '@mikro-orm/core';

import type { Organization } from '../organization/organization.entity';
import { TermsDocumentScope, TermsDocumentStatus } from './terms-document.constants';
import type { TermsDocumentMetadata } from './terms-document.entity';
import type { TermsDocument } from './terms-document.entity';

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

export function buildTermsDocumentStatusFilter(
  status: TermsDocumentStatus | undefined,
  now: number = Date.now(),
): FilterQuery<TermsDocument> {
  switch (status) {
    case TermsDocumentStatus.DRAFT:
      return { metadata: { publishedAt: null } };
    case TermsDocumentStatus.PUBLISHED:
      return {
        metadata: {
          publishedAt: { $ne: null },
        },
        $or: [
          { metadata: { terminatedAt: null } },
          { metadata: { terminatedAt: { $gt: new Date(now) } } },
        ],
      };
    case TermsDocumentStatus.TERMINATED:
      return {
        metadata: {
          publishedAt: { $ne: null },
          terminatedAt: { $lte: new Date(now) },
        },
      };
    default:
      return {};
  }
}

export function buildTermsDocumentScopeFilter(
  organization: EntityDataPropValue<Organization>,
  scope?: TermsDocumentScope,
): FilterQuery<TermsDocument> {
  if (scope === TermsDocumentScope.PLATFORM) {
    return { organization: null };
  }

  if (scope === TermsDocumentScope.ORGANIZATION) {
    return { organization };
  }

  return {
    $or: [
      { organization: null },
      { organization },
    ],
  };
}
