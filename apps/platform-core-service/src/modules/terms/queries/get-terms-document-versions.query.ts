/**
 * 약관 문서 버전 목록 조회 쿼리
 */
export class GetTermsDocumentVersionsQuery {
  constructor(
    readonly id: string,
    readonly keyword?: string,
  ) {}
}
