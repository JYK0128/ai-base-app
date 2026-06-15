export const TermsDocumentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  TERMINATED: 'TERMINATED',
} as const;

export type TermsDocumentStatus = typeof TermsDocumentStatus[keyof typeof TermsDocumentStatus];
