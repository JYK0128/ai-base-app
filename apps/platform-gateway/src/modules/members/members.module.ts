import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { MembersClient } from './members.client';
import { MEMBERS_SERVICE } from './members.constants';
import { MembersController } from './members.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MEMBERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [MembersController],
  providers: [MembersClient],
  exports: [MembersClient],
})
export class MembersModule {}
