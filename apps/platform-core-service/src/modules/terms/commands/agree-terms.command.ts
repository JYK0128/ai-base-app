/**
 * 약관 동의 커맨드
 */
export class AgreeTermsCommand {
  constructor(
    readonly memberId: string,
    readonly termsVersionId: string,
    readonly organizationId?: string,
  ) {}
}
