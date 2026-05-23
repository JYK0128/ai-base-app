/**
 * 번역 수정 커맨드
 */
export class UpdateTranslationCommand {
  constructor(
    public readonly namespace: string,
    public readonly key: string,
    public readonly locale: string,
    public readonly value: string,
  ) {}
}
