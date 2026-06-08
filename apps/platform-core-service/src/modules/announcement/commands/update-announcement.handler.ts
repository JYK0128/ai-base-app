import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import type { AnnouncementInput, AnnouncementOutputId } from '../announcement.types';
import { UpdateAnnouncementCommand } from './update-announcement.command';
import { UpdateAnnouncementAsserter } from './update-announcement.error';

/**
 * 공지사항 수정 핸들러
 */
@CommandHandler(UpdateAnnouncementCommand)
export class UpdateAnnouncementHandler implements ICommandHandler<UpdateAnnouncementCommand> {
  private readonly Asserter = UpdateAnnouncementAsserter;

  constructor(
  ) {}

  @Transactional()
  async execute({ payload }: UpdateAnnouncementCommand): Promise<AnnouncementOutputId> {
    await this.verifyAnnouncementPeriod(payload.data.startAt, payload.data.endAt);
    return this.processAnnouncementUpdate(payload.announcementId, payload.data);
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
   * STEP 2: 공지사항 수정 처리 (nativeUpdate 사용)
   */
  private async processAnnouncementUpdate(
    announcementId: string,
    input: AnnouncementInput,
  ): Promise<AnnouncementOutputId> {
    const announcement = Announcement.getReference(announcementId);
    const { title, content, ...metadata } = input;

    const affected = await announcement.nativeUpdate({
      title,
      content,
      metadata,
    });

    await this.Asserter.throwIf(affected === 0, 'ANNOUNCEMENT_NOT_FOUND');

    return { id: announcementId };
  }
}
