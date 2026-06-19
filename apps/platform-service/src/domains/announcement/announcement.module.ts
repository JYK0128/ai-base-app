import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Announcement, Member } from '@pkg/database';

import { AnnouncementController } from './announcement.controller';
import { CreateAnnouncementHandler } from './create-announcement/create-announcement.handler';
import { DeleteAnnouncementHandler } from './delete-announcement/delete-announcement.handler';
import { GetAnnouncementHandler } from './get-announcement/get-announcement.handler';
import { GetAnnouncementPageHandler } from './get-announcement-page/get-announcement-page.handler';
import { UpdateAnnouncementHandler } from './update-announcement/update-announcement.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Announcement, Member]),
  ],
  controllers: [AnnouncementController],
  providers: [GetAnnouncementPageHandler, GetAnnouncementHandler, CreateAnnouncementHandler, UpdateAnnouncementHandler, DeleteAnnouncementHandler],
})
export class AnnouncementModule {}
