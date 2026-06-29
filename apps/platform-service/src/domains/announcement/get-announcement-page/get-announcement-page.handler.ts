import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { GetAnnouncementPageContract } from './get-announcement-page.contract';
import { AnnouncementPageItem, GetAnnouncementPageResponseDto } from './get-announcement-page.response.dto';

@QueryHandler(GetAnnouncementPageContract)
export class GetAnnouncementPageHandler implements IQueryHandler<GetAnnouncementPageContract> {
  async execute(query: GetAnnouncementPageContract): Promise<GetAnnouncementPageResponseDto> {
    this.verifyAnnouncementPage(query);
    return this.processPage(query);
  }

  private verifyAnnouncementPage(_query: GetAnnouncementPageContract): void {
    // 공지 목록 조회 정책 검증 영역
  }

  private async processPage(query: GetAnnouncementPageContract): Promise<GetAnnouncementPageResponseDto> {
    const announcementsPage = await Announcement.findByPage(
      query.data.toFilterQuery(),
      {
        ...query.data.toPageOptions(),
      },
    );

    return new GetAnnouncementPageResponseDto({
      ...announcementsPage,
      items: announcementsPage.items.map((announcement) => new AnnouncementPageItem(announcement)),
    });
  }
}
