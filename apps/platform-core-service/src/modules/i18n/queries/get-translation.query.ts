/**
 * 번역 단건 조회 쿼리
 */
export class GetTranslationQuery {
  constructor(
    public readonly namespace: string,
    public readonly key: string,
    public readonly locale?: string,
  ) {}
}
