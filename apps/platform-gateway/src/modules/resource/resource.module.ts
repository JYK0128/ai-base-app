import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { CORE_SERVICE } from '../core/core.constants';
import { ResourceClient } from './resource.client';
import { ResourceController } from './resource.controller';

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
  controllers: [ResourceController],
  providers: [ResourceClient],
  exports: [ResourceClient],
})
export class ResourceModule {}
