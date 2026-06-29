import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { GetTermDocumentContract } from './get-term-document/get-term-document.contract';
import { GetTermDocumentRequestDto } from './get-term-document/get-term-document.request.dto';
import { GetTermDocumentListContract } from './get-term-document-list/get-term-document-list.contract';
import { GetTermDocumentListRequestDto } from './get-term-document-list/get-term-document-list.request.dto';
import { GetTermDocumentListResponseDto } from './get-term-document-list/get-term-document-list.response.dto';
import { GetTermDocumentVersionListContract } from './get-term-document-version-list/get-term-document-version-list.contract';
import { GetTermDocumentVersionListRequestDto } from './get-term-document-version-list/get-term-document-version-list.request.dto';
import { GetTermDocumentVersionListResponseDto } from './get-term-document-version-list/get-term-document-version-list.response.dto';
import { GetTermDocumentDetailResponseDto } from './get-term-document/get-term-document.response.dto';

@Controller('terms')
export class TermsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('documents')
  @SwaggerResponse(GetTermDocumentListResponseDto)
  async getTermsDocumentList(
    @Query() query: GetTermDocumentListRequestDto,
  ): Promise<GetTermDocumentListResponseDto> {
    return this.queryBus.execute(new GetTermDocumentListContract(query));
  }

  @Get('documents/:id')
  @SwaggerResponse(GetTermDocumentDetailResponseDto)
  async getTermsDocument(
    @Param('id') id: string,
  ): Promise<GetTermDocumentDetailResponseDto> {
    return this.queryBus.execute(new GetTermDocumentContract({ id } satisfies GetTermDocumentRequestDto));
  }

  @Get('documents/:id/versions')
  @SwaggerResponse(GetTermDocumentVersionListResponseDto)
  async getTermsDocumentVersions(
    @Param('id') id: string,
    @Query() query: GetTermDocumentVersionListRequestDto,
  ): Promise<GetTermDocumentVersionListResponseDto> {
    return this.queryBus.execute(new GetTermDocumentVersionListContract(id, query));
  }
}
