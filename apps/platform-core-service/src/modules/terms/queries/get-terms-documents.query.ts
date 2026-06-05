/**
 * 약관 문서 목록 조회 쿼리
 */
export class GetTermsDocumentsQuery {
  constructor(
    readonly organizationId?: string,
    readonly scope?: 'platform' | 'organization',
    readonly status?: string,
    readonly keyword?: string,
  ) {}
}
