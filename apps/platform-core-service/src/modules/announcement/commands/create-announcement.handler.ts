import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository, Manager } from '@pkg/database';

import { CreateAnnouncementAsserter, CreateAnnouncementCommand } from './create-announcement.helpers';

/**
 * 공지사항 생성 핸들러
 */
@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  private readonly Asserter = CreateAnnouncementAsserter;

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: AnnouncementRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateAnnouncementCommand): Promise<Announcement> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 공지사항 생성
   */
  private processCreation(command: CreateAnnouncementCommand): Announcement {
    const author = this.em.getReference(Manager, command.authorId);

    const announcement = this.announcementRepo.create({
      title: command.title,
      content: command.content,
      isPublished: command.isPublished ?? false,
      author,
    });

    this.em.persist(announcement);
    return announcement;
  }
}
