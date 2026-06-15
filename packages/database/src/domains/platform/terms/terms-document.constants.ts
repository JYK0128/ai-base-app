export const TermsDocumentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  TERMINATED: 'TERMINATED',
} as const;

export type TermsDocumentStatus = typeof TermsDocumentStatus[keyof typeof TermsDocumentStatus];

export const TermsDocumentScope = {
  PLATFORM: 'platform',
  ORGANIZATION: 'organization',
} as const;

export type TermsDocumentScope = typeof TermsDocumentScope[keyof typeof TermsDocumentScope];
