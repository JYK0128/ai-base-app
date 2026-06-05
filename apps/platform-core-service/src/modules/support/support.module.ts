import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberAccount, SupportTicket } from '@pkg/database';

import { SupportHandlers } from './handlers';
import { SupportController } from './support.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([SupportTicket, MemberAccount]),
  ],
  controllers: [SupportController],
  providers: [...SupportHandlers],
})
export class SupportModule {}
