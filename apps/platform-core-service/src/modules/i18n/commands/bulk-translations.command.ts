/**
 * 번역 일괄 처리 커맨드
 */
export type BulkTranslationOperation = {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  namespace: string;
  key: string;
  locale: string;
  value?: string;
};

export class BulkTranslationsCommand {
  constructor(
    public readonly operations: BulkTranslationOperation[],
  ) {}
}
