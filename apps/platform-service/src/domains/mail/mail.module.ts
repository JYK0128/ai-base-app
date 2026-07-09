import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { SendInviteEmailHandler } from './invite-email/invite-email.handler';
import { InviteEmailDeliveryResultBatcher } from './invite-email/invite-email-delivery-result.batcher';
import { InviteEmailDeliveryResultPublisher } from './invite-email/invite-email-delivery-result.publisher';
import { MAIL_QUEUE_NAMES } from './mail.contract';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_DELIVERY_RESULT_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: MAIL_QUEUE_NAMES.INVITE_DELIVERY_RESULT,
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
  providers: [MailService, SendInviteEmailHandler, InviteEmailDeliveryResultPublisher, InviteEmailDeliveryResultBatcher],
})
export class MailModule {}
