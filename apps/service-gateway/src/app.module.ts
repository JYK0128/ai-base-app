import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ENV } from './env.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    TerminusModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
