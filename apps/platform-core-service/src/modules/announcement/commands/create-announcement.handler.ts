import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementMetadata } from '@pkg/database';

import type { AnnouncementInput, AnnouncementOutputId } from '../announcement.types';
import { CreateAnnouncementCommand } from './create-announcement.command';
import { CreateAnnouncementAsserter } from './create-announcement.error';

/**
 * 공지사항 생성 핸들러
 */
@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  private readonly Asserter = CreateAnnouncementAsserter;

  constructor(
  ) {}

  @Transactional()
  async execute({ payload }: CreateAnnouncementCommand): Promise<AnnouncementOutputId> {
    await this.verifyAnnouncementPeriod(payload.data.startAt, payload.data.endAt);
    return this.processAnnouncementCreation(payload.data);
  }

  /**
   * STEP 1: 게시 기간 검증
   */
  private async verifyAnnouncementPeriod(startAt?: string, endAt?: string): Promise<void> {
    await this.Asserter.throwIf(
      !!startAt
      && !!endAt
      && new Date(startAt).getTime() >= new Date(endAt).getTime(),
      'INVALID_PERIOD',
    );
  }

  /**
   * STEP 2: 공지사항 생성 처리
   */
  private async processAnnouncementCreation(
    input: AnnouncementInput,
  ): Promise<AnnouncementOutputId> {
    const { title, content, ...rest } = input;
    const metadata = new AnnouncementMetadata({
      ...rest,
      publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : undefined,
      startAt: rest.startAt ? new Date(rest.startAt) : undefined,
      endAt: rest.endAt ? new Date(rest.endAt) : undefined,
    });

    const announcement = Announcement.create({
      title,
      content,
      metadata,
    });

    return { id: announcement.id };
  }
}
