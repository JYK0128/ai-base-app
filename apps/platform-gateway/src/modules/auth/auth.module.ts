import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { AuthClient } from './auth.client';
import { AUTH_SERVICE } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.AUTH_SERVICE_HOST,
          port: ENV.AUTH_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthClient],
  exports: [AuthService, AuthClient],
})
export class AuthModule {}
