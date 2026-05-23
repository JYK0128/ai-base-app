/**
 * 공지사항 목록 조회 쿼리
 */
export class GetAnnouncementsQuery {
  constructor(
    public readonly isPublishedOnly?: boolean,
  ) {}
}
