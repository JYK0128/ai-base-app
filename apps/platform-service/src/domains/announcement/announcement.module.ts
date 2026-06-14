import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Announcement, Member } from '@pkg/database';

import { AnnouncementController } from './announcement.controller';
import { DeleteAnnouncementHandler } from './delete-announcement/delete-announcement.handler';
import { GetAnnouncementsHandler } from './get-announcements/get-announcements.handler';
import { SaveAnnouncementHandler } from './save-announcement/save-announcement.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Announcement, Member]),
  ],
  controllers: [AnnouncementController],
  providers: [GetAnnouncementsHandler, SaveAnnouncementHandler, DeleteAnnouncementHandler],
})
export class AnnouncementModule {}
