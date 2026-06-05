import { TermsVersionStatus } from '@pkg/database';

/**
 * 약관 버전 생성 커맨드
 */
export class CreateTermsVersionCommand {
  constructor(
    readonly termsDocumentId: string,
    readonly label: string,
    readonly content: string,
    readonly effectiveAt: Date,
    readonly status: TermsVersionStatus,
  ) {}
}
