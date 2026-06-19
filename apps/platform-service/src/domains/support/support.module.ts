import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SupportTicket } from '@pkg/database';

import { GetTicketPageHandler } from './get-ticket-page/get-ticket-page.handler';
import { SupportController } from './support.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([SupportTicket]),
  ],
  controllers: [SupportController],
  providers: [GetTicketPageHandler],
})
export class SupportModule {}
