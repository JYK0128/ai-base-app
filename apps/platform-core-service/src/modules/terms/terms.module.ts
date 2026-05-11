import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ManagerTermsConsent, TermsDocument, TermsVersion } from '@pkg/database';

import { TermsHandlers } from './handlers';
import { TermsController } from './terms.controller';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([TermsDocument, TermsVersion, ManagerTermsConsent])],
  controllers: [TermsController],
  providers: [...TermsHandlers],
})
export class TermsModule {}
