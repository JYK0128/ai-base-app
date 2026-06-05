import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository, Member, MemberAccount, MemberAccountRepository } from '@pkg/database';

import { applyAnnouncementInput, buildAnnouncementRecord } from '../announcement.mapper';
import type { AnnouncementRecord } from '../announcement.types';
import { CreateAnnouncementCommand } from './create-announcement.command';
import { CreateAnnouncementAsserter } from './create-announcement.error';

/**
 * 공지사항 생성 핸들러
 */
@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  private readonly Asserter = CreateAnnouncementAsserter;

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: AnnouncementRepository,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepo: MemberAccountRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateAnnouncementCommand): Promise<AnnouncementRecord> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 작성자 확인
   */
  private async processCreation(command: CreateAnnouncementCommand): Promise<AnnouncementRecord> {
    const authorAccount = await this.Asserter.assert(
      this.memberAccountRepo.findOne(
        { id: command.memberId },
        { populate: ['member.accounts'] },
      ),
      'AUTHOR_NOT_FOUND',
    );
    const author = authorAccount.member as Member;

    const title = command.data.title.trim();
    const content = command.data.content.trim();

    await this.Asserter.throwIf(title.length === 0, 'TITLE_REQUIRED');
    await this.Asserter.throwIf(content.length === 0, 'CONTENT_REQUIRED');
    await this.Asserter.throwIf(
      !!command.data.startAt
      && !!command.data.endAt
      && new Date(command.data.startAt).getTime() >= new Date(command.data.endAt).getTime(),
      'INVALID_PERIOD',
    );

    const existingAnnouncement = command.data.id
      ? await this.announcementRepo.findOne({ id: command.data.id })
      : undefined;

    const nextAnnouncement = existingAnnouncement ?? this.announcementRepo.create({
      ...(command.data.id ? { id: command.data.id } : {}),
      title,
      content,
      isPublished: false,
      author,
      metadata: {},
    });

    applyAnnouncementInput(nextAnnouncement, {
      ...command.data,
      title,
      content,
    });

    nextAnnouncement.author = author;
    this.em.persist(nextAnnouncement);
    await this.em.flush();

    return buildAnnouncementRecord(nextAnnouncement);
  }
}
