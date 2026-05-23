/**
 * 번역 삭제 커맨드
 */
export class DeleteTranslationCommand {
  constructor(
    public readonly namespace: string,
    public readonly key: string,
    public readonly locale: string,
  ) {}
}
