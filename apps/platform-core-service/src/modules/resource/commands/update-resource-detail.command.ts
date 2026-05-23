/**
 * 리소스 상세정보 수정 커맨드
 */
export class UpdateResourceDetailCommand {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly name: string,
    readonly path?: string,
    readonly icon?: string,
  ) {}
}
