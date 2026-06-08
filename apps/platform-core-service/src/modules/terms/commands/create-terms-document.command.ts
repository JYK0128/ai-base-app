/**
 * 약관 문서 생성 커맨드
 */
export class CreateTermsDocumentCommand {
  constructor(
    readonly code: string,
    readonly title: string,
    readonly required: boolean,
    readonly organizationId?: string | null,
  ) {}
}
