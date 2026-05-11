import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository, Manager } from '@pkg/database';

export { CreateAnnouncementCommand } from './create-announcement.helpers';
import { CreateAnnouncementCommand } from './create-announcement.helpers';

@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: AnnouncementRepository,
  ) {}

  @Transactional()
  async execute(command: CreateAnnouncementCommand): Promise<Announcement> {
    const em = this.announcementRepo.getEntityManager();
    const author = em.getReference(Manager, command.authorId);

    const announcement = this.announcementRepo.create({
      title: command.title,
      content: command.content,
      isPublished: command.isPublished ?? false,
      author,
    });

    em.persist(announcement);
    return announcement;
  }
}
