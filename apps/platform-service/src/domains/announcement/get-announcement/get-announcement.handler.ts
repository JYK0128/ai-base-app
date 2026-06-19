import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, CoreRepository } from '@pkg/database';

import { GetAnnouncementContract } from './get-announcement.contract';
import { GetAnnouncementAsserter } from './get-announcement.error';
import { GetAnnouncementResponseDto } from './get-announcement.response.dto';

@QueryHandler(GetAnnouncementContract)
export class GetAnnouncementHandler implements IQueryHandler<GetAnnouncementContract> {
  private readonly Asserter = GetAnnouncementAsserter;

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
  ) {}

  async execute({ data }: GetAnnouncementContract): Promise<GetAnnouncementResponseDto> {
    const announcement = await this.Asserter.assert(
      this.announcementRepository.findOne({ id: data.id }),
      'ANNOUNCEMENT_NOT_FOUND',
    );

    return new GetAnnouncementResponseDto(announcement);
  }
}
