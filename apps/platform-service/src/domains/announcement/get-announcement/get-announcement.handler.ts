import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { GetAnnouncementContract } from './get-announcement.contract';
import { GetAnnouncementAsserter } from './get-announcement.error';
import { GetAnnouncementResponseDto } from './get-announcement.response.dto';

@QueryHandler(GetAnnouncementContract)
export class GetAnnouncementHandler implements IQueryHandler<GetAnnouncementContract> {
  private readonly Asserter = GetAnnouncementAsserter;

  async execute(query: GetAnnouncementContract): Promise<GetAnnouncementResponseDto> {
    this.verifyAnnouncement(query);
    return this.processDetail(query);
  }

  private verifyAnnouncement(_query: GetAnnouncementContract): void {
    // 공지 조회 정책 검증 영역
  }

  private async processDetail(query: GetAnnouncementContract): Promise<GetAnnouncementResponseDto> {
    const announcement = await this.Asserter.assert(
      Announcement.findOne({ id: query.data.id }),
      'ANNOUNCEMENT_NOT_FOUND',
    );

    return new GetAnnouncementResponseDto(announcement);
  }
}
