/**
 * 리소스 정렬 순서 수정 커맨드
 */
export class UpdateResourceSortCommand {
  constructor(
    readonly id: string,
    readonly sortOrder: number,
  ) {}
}
