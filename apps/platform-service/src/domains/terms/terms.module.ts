import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsConsent, TermsDocument, TermsVersion } from '@pkg/database';

import { AgreeTermsHandler } from './agreements/agree-terms.handler';
import { GetActiveTermsHandler } from './queries/get-active-terms.handler';
import { GetTermsDocumentHandler } from './queries/get-terms-document.handler';
import { GetTermsDocumentVersionsHandler } from './queries/get-terms-document-versions.handler';
import { TermsController } from './terms.controller';
import { TermsAgreementService } from './terms-agreement.service';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsConsent, TermsDocument, TermsVersion]),
  ],
  controllers: [TermsController],
  providers: [AgreeTermsHandler, GetActiveTermsHandler, GetTermsDocumentHandler, GetTermsDocumentVersionsHandler, TermsAgreementService],
  exports: [TermsAgreementService],
})
export class TermsModule {}
