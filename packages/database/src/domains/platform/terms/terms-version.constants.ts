export const TermsVersionStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type TermsVersionStatus = typeof TermsVersionStatus[keyof typeof TermsVersionStatus];
