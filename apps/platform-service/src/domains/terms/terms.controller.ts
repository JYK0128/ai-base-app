import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetTermsDocumentContract } from './get-terms-document/get-terms-document.contract';
import { GetTermsDocumentRequestDto } from './get-terms-document/get-terms-document.request.dto';
import { GetTermsDocumentDetailResponseDto, GetTermsDocumentResponseDto, GetTermsDocumentVersionResponseDto } from './get-terms-document/get-terms-document.response.dto';
import { GetTermsDocumentPageContract } from './get-terms-document-page/get-terms-document-page.contract';
import { GetTermsDocumentPageRequestDto } from './get-terms-document-page/get-terms-document-page.request.dto';
import { GetTermsDocumentVersionsContract } from './get-terms-document-versions/get-terms-document-versions.contract';
import { GetTermsDocumentVersionsRequestDto } from './get-terms-document-versions/get-terms-document-versions.request.dto';

@Controller('terms')
export class TermsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('documents')
  async getTermsDocumentPage(
    @Query() query: GetTermsDocumentPageRequestDto,
  ): Promise<GetTermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentPageContract(query));
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
