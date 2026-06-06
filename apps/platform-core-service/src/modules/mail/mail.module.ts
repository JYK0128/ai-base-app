import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '../../env';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailProducerService } from './mail-producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MAIL_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: 'mail_queue',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            frameMax: 8192,
          },
        },
      },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService, MailProducerService],
  exports: [MailProducerService, MailService],
})
export class MailModule {}
