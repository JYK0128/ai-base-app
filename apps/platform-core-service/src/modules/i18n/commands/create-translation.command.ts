/**
 * 번역 생성 커맨드
 */
export class CreateTranslationCommand {
  constructor(
    public readonly namespace: string,
    public readonly key: string,
    public readonly locale: string,
    public readonly value: string,
  ) {}
}
