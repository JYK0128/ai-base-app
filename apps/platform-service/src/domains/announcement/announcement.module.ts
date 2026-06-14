import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Announcement, Member } from '@pkg/database';

import { AnnouncementController } from './announcement.controller';
import { DeleteAnnouncementHandler } from './delete-announcement/delete-announcement.handler';
import { GetAnnouncementsHandler } from './get-announcements/get-announcements.handler';
import { CreateAnnouncementHandler } from './save-announcement/save-announcement.handler';
import { UpdateAnnouncementHandler } from './update-announcement/update-announcement.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Announcement, Member]),
  ],
  controllers: [AnnouncementController],
  providers: [GetAnnouncementsHandler, CreateAnnouncementHandler, UpdateAnnouncementHandler, DeleteAnnouncementHandler],
})
export class AnnouncementModule {}
