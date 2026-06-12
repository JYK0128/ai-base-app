import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetActiveTermsHandler } from './queries/get-active-terms.handler';
import { GetTermsDocumentHandler } from './queries/get-terms-document.handler';
import { GetTermsDocumentVersionsHandler } from './queries/get-terms-document-versions.handler';
import { TermsController } from './terms.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument, TermsVersion]),
  ],
  controllers: [TermsController],
  providers: [GetActiveTermsHandler, GetTermsDocumentHandler, GetTermsDocumentVersionsHandler],
})
export class TermsModule {}
