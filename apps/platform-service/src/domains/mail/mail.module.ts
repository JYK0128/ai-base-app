import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MailHandlers } from './handlers';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [CqrsModule],
  controllers: [MailController],
  providers: [MailService, ...MailHandlers],
})
export class MailModule {}
