import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { SendInviteEmailHandler } from './send-invite-email/send-invite-email.handler';

@Module({
  imports: [CqrsModule],
  controllers: [MailController],
  providers: [MailService, SendInviteEmailHandler],
})
export class MailModule {}
