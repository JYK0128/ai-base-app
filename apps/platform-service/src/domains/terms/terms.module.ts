import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument } from '@pkg/database';

import { GetActiveTermsHandler } from './queries/get-active-terms.handler';
import { TermsController } from './terms.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument]),
  ],
  controllers: [TermsController],
  providers: [GetActiveTermsHandler],
})
export class TermsModule {}
