import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetActiveTermsContract } from './queries/get-active-terms.contract';
import type { TermsDocumentResponseDto } from './queries/get-active-terms.response.dto';
import { GetTermsDocumentContract } from './queries/get-terms-document.contract';
import type { TermsDocumentDetailResponseDto } from './queries/get-terms-document.response.dto';
import type { TermsVersionResponseDto } from './queries/get-terms-document.response.dto';
import { GetTermsDocumentVersionsContract } from './queries/get-terms-document-versions.contract';
import type { GetTermsDocumentVersionsRequestDto } from './queries/get-terms-document-versions.request.dto';
import { GetTermsDocumentsContract } from './queries/get-terms-documents.contract';
import type { GetTermsDocumentsRequestDto } from './queries/get-terms-documents.request.dto';

@Controller('terms')
export class TermsController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getActiveTerms(): Promise<TermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetActiveTermsContract());
  }

  @Get('documents')
  async getTermsDocuments(
    @Query() query: GetTermsDocumentsRequestDto,
  ): Promise<TermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentsContract(query));
  }

  @Get('documents/:id')
  async getTermsDocument(
    @Param('id') id: string,
  ): Promise<TermsDocumentDetailResponseDto> {
    return this.queryBus.execute(new GetTermsDocumentContract(id));
  }

  @Get('documents/:id/versions')
  async getTermsDocumentVersions(
    @Param('id') id: string,
    @Query() query: GetTermsDocumentVersionsRequestDto,
  ): Promise<TermsVersionResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentVersionsContract({
      id,
      keyword: query.keyword,
    }));
  }
}
