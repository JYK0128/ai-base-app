import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { SupportClient } from './support.client';
import { SUPPORT_SERVICE } from './support.constants';
import { SupportController } from './support.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SUPPORT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [SupportController],
  providers: [SupportClient],
  exports: [SupportClient],
})
export class SupportModule {}
