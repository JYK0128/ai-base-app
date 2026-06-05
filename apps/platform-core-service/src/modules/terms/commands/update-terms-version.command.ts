import { TermsVersionStatus } from '@pkg/database';

/**
 * 약관 버전 수정 커맨드
 */
export class UpdateTermsVersionCommand {
  constructor(
    readonly id: string,
    readonly label: string,
    readonly content: string,
    readonly effectiveAt: Date,
    readonly status: TermsVersionStatus,
  ) {}
}
