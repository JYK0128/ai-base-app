import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { CancelTermDocumentTerminationHandler } from './cancel-term-document-termination/cancel-term-document-termination.handler';
import { CreateTermDocumentHandler } from './create-term-document/create-term-document.handler';
import { CreateTermDocumentVersionHandler } from './create-term-document-version/create-term-document-version.handler';
import { DeleteTermDocumentHandler } from './delete-term-document/delete-term-document.handler';
import { DeleteTermDocumentVersionHandler } from './delete-term-document-version/delete-term-document-version.handler';
import { GetTermDocumentHandler } from './get-term-document/get-term-document.handler';
import { GetTermDocumentListHandler } from './get-term-document-list/get-term-document-list.handler';
import { GetTermDocumentVersionListHandler } from './get-term-document-version-list/get-term-document-version-list.handler';
import { ScheduleTermDocumentTerminationHandler } from './schedule-term-document-termination/schedule-term-document-termination.handler';
import { TermsController } from './term.controller';
import { UpdateTermDocumentVersionHandler } from './update-term-document-version/update-term-document-version.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument, TermsVersion]),
  ],
  controllers: [TermsController],
  providers: [
    GetTermDocumentHandler,
    GetTermDocumentListHandler,
    GetTermDocumentVersionListHandler,
    CreateTermDocumentHandler,
    CreateTermDocumentVersionHandler,
    DeleteTermDocumentHandler,
    DeleteTermDocumentVersionHandler,
    ScheduleTermDocumentTerminationHandler,
    CancelTermDocumentTerminationHandler,
    UpdateTermDocumentVersionHandler,
  ],
})
export class TermModule {}
