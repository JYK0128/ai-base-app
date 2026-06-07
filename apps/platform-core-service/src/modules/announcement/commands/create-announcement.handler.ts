import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository, Member, MemberAccount, MemberAccountRepository } from '@pkg/database';

import { applyAnnouncementInput, buildAnnouncementRecord } from '../announcement.mapper';
import type { AnnouncementInput, AnnouncementRecord } from '../announcement.types';
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
    const author = await this.identifyAuthor(command.memberId);
    await this.verifyAnnouncementPeriod(command.data.startAt, command.data.endAt);
    const existingAnnouncement = await this.identifyExistingAnnouncement(command.data.id);

    return this.processAnnouncement(author, existingAnnouncement, command.data);
  }

  /**
   * STEP 1: 작성자 식별
   */
  private async identifyAuthor(memberId: string): Promise<Member> {
    const authorAccount = await this.Asserter.assert(
      this.memberAccountRepo.findOne(
        { id: memberId },
        { populate: ['member.accounts'] },
      ),
      'AUTHOR_NOT_FOUND',
    );

    return authorAccount.member as Member;
  }

  /**
   * STEP 2: 게시 기간 검증
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
   * STEP 3: 기존 공지사항 식별
   */
  private async identifyExistingAnnouncement(announcementId?: string) {
    if (!announcementId) {
      return undefined;
    }

    return await this.announcementRepo.findOne({ id: announcementId }) ?? undefined;
  }

  /**
   * STEP 4: 공지사항 생성/수정 처리
   */
  private async processAnnouncement(
    author: Member,
    existingAnnouncement: Announcement | undefined,
    input: AnnouncementInput,
  ): Promise<AnnouncementRecord> {
    const announcement = existingAnnouncement ?? this.createAnnouncement(author, input);

    applyAnnouncementInput(announcement, input);

    announcement.author = author;
    this.em.persist(announcement);
    await this.em.flush();

    return buildAnnouncementRecord(announcement);
  }

  private createAnnouncement(
    author: Member,
    input: AnnouncementInput,
  ) {
    return this.announcementRepo.create({
      ...(input.id ? { id: input.id } : {}),
      title: input.title,
      content: input.content,
      author,
      metadata: {},
    });
  }
}
