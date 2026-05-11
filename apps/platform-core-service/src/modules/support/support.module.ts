import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SupportTicket } from '@pkg/database';

import { SupportHandlers } from './handlers';
import { SupportController } from './support.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([SupportTicket]),
  ],
  controllers: [SupportController],
  providers: [...SupportHandlers],
})
export class SupportModule {}
