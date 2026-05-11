import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { CoreClient } from './core.client';
import { CORE_SERVICE } from './core.constants';
import { CoreController } from './core.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CORE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [CoreController],
  providers: [CoreClient],
  exports: [CoreClient],
})
export class CoreModule {}
