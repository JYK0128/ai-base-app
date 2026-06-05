import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { ResourceClient } from './resource.client';
import { RESOURCE_SERVICE } from './resource.constants';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RESOURCE_SERVICE,
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
