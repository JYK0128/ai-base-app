import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { AuthServiceClient } from './clients/auth-service.client';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: ENV.AUTH_SERVICE_HOST,
          port: ENV.AUTH_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, AuthServiceClient],
  exports: [GatewayService, AuthServiceClient],
})
export class GatewayModule {}
