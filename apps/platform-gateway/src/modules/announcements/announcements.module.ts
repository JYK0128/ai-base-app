import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { AnnouncementsClient } from './announcements.client';
import { ANNOUNCEMENTS_SERVICE } from './announcements.constants';
import { AnnouncementsController } from './announcements.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ANNOUNCEMENTS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsClient],
  exports: [AnnouncementsClient],
})
export class AnnouncementsModule {}
