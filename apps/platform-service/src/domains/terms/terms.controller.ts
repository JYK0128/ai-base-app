import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';

import { CreateTermsAgreementContract } from './agreements/agree-terms.contract';
import { CreateTermsAgreementRequestDto } from './agreements/agree-terms.request.dto';
import { GetActiveTermsContract } from './queries/get-active-terms.contract';
import { GetTermsDocumentResponseDto } from './queries/get-active-terms.response.dto';
import { GetTermsDocumentContract } from './queries/get-terms-document.contract';
import { GetTermsDocumentRequestDto } from './queries/get-terms-document.request.dto';
import { GetTermsDocumentDetailResponseDto } from './queries/get-terms-document.response.dto';
import { CreateTermsAgreementResponseDto } from './queries/get-terms-document.response.dto';
import { GetTermsDocumentVersionResponseDto } from './queries/get-terms-document.response.dto';
import { GetTermsDocumentVersionsContract } from './queries/get-terms-document-versions.contract';
import { GetTermsDocumentVersionsRequestDto } from './queries/get-terms-document-versions.request.dto';
import { GetTermsDocumentsContract } from './queries/get-terms-documents.contract';
import { GetTermsDocumentsRequestDto } from './queries/get-terms-documents.request.dto';

@Controller('terms')
export class TermsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Bypass(BYPASS_POLICIES.TERMS)
  async getActiveTerms(): Promise<GetTermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetActiveTermsContract());
  }

  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('agreements')
  async agreeTerms(
    @Body() body: CreateTermsAgreementRequestDto,
  ): Promise<CreateTermsAgreementResponseDto> {
    return this.commandBus.execute(new CreateTermsAgreementContract(body));
  }

  @Get('documents')
  @Bypass(BYPASS_POLICIES.TERMS)
  async getTermsDocuments(
    @Query() query: GetTermsDocumentsRequestDto,
  ): Promise<GetTermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentsContract(query));
  }

  @Get('documents/:id')
  @Bypass(BYPASS_POLICIES.TERMS)
  async getTermsDocument(
    @Param('id') id: string,
  ): Promise<GetTermsDocumentDetailResponseDto> {
    return this.queryBus.execute(new GetTermsDocumentContract({ id } satisfies GetTermsDocumentRequestDto));
  }

  @Get('documents/:id/versions')
  @Bypass(BYPASS_POLICIES.TERMS)
  async getTermsDocumentVersions(
    @Param('id') id: string,
    @Query() query: GetTermsDocumentVersionsRequestDto,
  ): Promise<GetTermsDocumentVersionResponseDto[]> {
    return this.queryBus.execute(new GetTermsDocumentVersionsContract(id, query));
  }
}
