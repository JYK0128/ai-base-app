import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Announcement, MemberAccount } from '@pkg/database';

import { AnnouncementController } from './announcement.controller';
import { AnnouncementHandlers } from './handlers';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Announcement, MemberAccount]),
  ],
  controllers: [AnnouncementController],
  providers: [...AnnouncementHandlers],
})
export class AnnouncementModule {}
