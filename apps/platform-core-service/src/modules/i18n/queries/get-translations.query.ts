/**
 * 번역 배치 조회 쿼리
 */
export class GetTranslationsQuery {
  constructor(
    public readonly namespace?: string,
    public readonly keys?: string[],
    public readonly locale?: string,
  ) {}
}
