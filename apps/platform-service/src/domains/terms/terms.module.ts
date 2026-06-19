import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermsDocumentHandler } from './get-terms-document/get-terms-document.handler';
import { GetTermsDocumentVersionsHandler } from './get-terms-document-versions/get-terms-document-versions.handler';
import { TermsController } from './terms.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument, TermsVersion]),
  ],
  controllers: [TermsController],
  providers: [GetTermsDocumentHandler, GetTermsDocumentVersionsHandler],
})
export class TermsModule {}
