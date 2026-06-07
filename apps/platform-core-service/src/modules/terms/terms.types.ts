import type { TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';

export type GetActiveTermsInput = {
  organizationId?: string
};

export type GetTermsDocumentsInput = {
  organizationId?: string
  scope?: 'platform' | 'organization'
  status?: string
  keyword?: string
};

export type GetTermsDocumentInput = Pick<TermsDocument, 'id'>;

export type GetTermsDocumentVersionsInput = Pick<TermsDocument, 'id'> & {
  keyword?: string
};

export type CreateTermsDocumentInput = Pick<TermsDocument, 'code' | 'title' | 'required'>
  & {
    organizationId?: string | null
  };

export type DeprecateTermsDocumentInput = Pick<TermsDocument, 'id'> & {
  deprecatedAt: string | Date
};

export type CancelDeprecationTermsDocumentInput = Pick<TermsDocument, 'id'>;

export type DeleteTermsDocumentInput = Pick<TermsDocument, 'id'>;

export type CreateTermsVersionInput = Pick<TermsVersion, 'label' | 'content'> & {
  termsDocumentId: string
  effectiveAt: Date | string
  status: TermsVersionStatus
};

export type UpdateTermsVersionInput = Pick<TermsVersion, 'id' | 'label' | 'content' | 'status'> & {
  effectiveAt: Date | string
};

export type AgreeTermsInput = {
  memberId: string
  termsVersionId: string
  organizationId?: string
};
