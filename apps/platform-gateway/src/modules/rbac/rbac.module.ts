import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { CORE_SERVICE } from '../core/core.constants';
import { RbacClient } from './rbac.client';
import { RbacController } from './rbac.controller';

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
  controllers: [RbacController],
  providers: [RbacClient],
  exports: [RbacClient],
})
export class RbacModule {}
