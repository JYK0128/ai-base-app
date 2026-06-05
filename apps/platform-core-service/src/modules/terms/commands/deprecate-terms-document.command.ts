/**
 * 약관 문서 폐기 커맨드
 */
export class DeprecateTermsDocumentCommand {
  constructor(
    readonly id: string,
    readonly deprecatedAt: Date,
  ) {}
}
