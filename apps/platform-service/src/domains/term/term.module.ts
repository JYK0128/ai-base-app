import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermDocumentHandler } from './get-term-document/get-term-document.handler';
import { GetTermDocumentListHandler } from './get-term-document-list/get-term-document-list.handler';
import { GetTermDocumentVersionListHandler } from './get-term-document-version-list/get-term-document-version-list.handler';
import { TermsController } from './term.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument, TermsVersion]),
  ],
  controllers: [TermsController],
  providers: [GetTermDocumentHandler, GetTermDocumentListHandler, GetTermDocumentVersionListHandler],
})
export class TermModule {}
