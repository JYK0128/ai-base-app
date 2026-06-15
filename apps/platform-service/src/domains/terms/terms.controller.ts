import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetTermsDocumentContract } from './queries/get-terms-document.contract';
import { GetTermsDocumentRequestDto } from './queries/get-terms-document.request.dto';
import { GetTermsDocumentDetailResponseDto, GetTermsDocumentResponseDto, GetTermsDocumentVersionResponseDto } from './queries/get-terms-document.response.dto';
import { GetTermsDocumentVersionsContract } from './queries/get-terms-document-versions.contract';
import { GetTermsDocumentVersionsRequestDto } from './queries/get-terms-document-versions.request.dto';
import { GetTermsDocumentsContract } from './queries/get-terms-documents.contract';
import { GetTermsDocumentsRequestDto } from './queries/get-terms-documents.request.dto';

@Controller('terms')
export class TermsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('documents')
  async getTermsDocuments(
    @Query() query: GetTermsDocumentsRequestDto,
  ): Promise<GetTermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentsContract(query));
  }

  @Get('documents/:id')
  async getTermsDocument(
    @Param('id') id: string,
  ): Promise<GetTermsDocumentDetailResponseDto> {
    return this.queryBus.execute(new GetTermsDocumentContract({ id } satisfies GetTermsDocumentRequestDto));
  }

  @Get('documents/:id/versions')
  async getTermsDocumentVersions(
    @Param('id') id: string,
    @Query() query: GetTermsDocumentVersionsRequestDto,
  ): Promise<GetTermsDocumentVersionResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentVersionsContract(id, query));
  }
}
