/**
 * 약관 동의 커맨드
 */
export class AgreeTermsCommand {
  constructor(
    readonly managerId: string,
    readonly termsVersionId: string,
    readonly organizationId?: string,
    readonly source?: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {}
}
