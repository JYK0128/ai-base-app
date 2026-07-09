import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { CancelTermDocumentTerminationContract } from './cancel-term-document-termination/cancel-term-document-termination.contract';
import { CancelTermDocumentTerminationResponseDto } from './cancel-term-document-termination/cancel-term-document-termination.response.dto';
import { CreateTermDocumentContract } from './create-term-document/create-term-document.contract';
import { CreateTermDocumentRequestDto } from './create-term-document/create-term-document.request.dto';
import { CreateTermDocumentResponseDto } from './create-term-document/create-term-document.response.dto';
import { CreateTermDocumentVersionContract } from './create-term-document-version/create-term-document-version.contract';
import { CreateTermDocumentVersionRequestDto } from './create-term-document-version/create-term-document-version.request.dto';
import { CreateTermDocumentVersionResponseDto } from './create-term-document-version/create-term-document-version.response.dto';
import { DeleteTermDocumentContract } from './delete-term-document/delete-term-document.contract';
import { DeleteTermDocumentRequestDto } from './delete-term-document/delete-term-document.request.dto';
import { DeleteTermDocumentResponseDto } from './delete-term-document/delete-term-document.response.dto';
import { DeleteTermDocumentVersionContract } from './delete-term-document-version/delete-term-document-version.contract';
import { DeleteTermDocumentVersionResponseDto } from './delete-term-document-version/delete-term-document-version.response.dto';
import { GetTermDocumentContract } from './get-term-document/get-term-document.contract';
import { GetTermDocumentRequestDto } from './get-term-document/get-term-document.request.dto';
import { GetTermDocumentDetailResponseDto } from './get-term-document/get-term-document.response.dto';
import { GetTermDocumentListContract } from './get-term-document-list/get-term-document-list.contract';
import { GetTermDocumentListRequestDto } from './get-term-document-list/get-term-document-list.request.dto';
import { GetTermDocumentListResponseDto } from './get-term-document-list/get-term-document-list.response.dto';
import { GetTermDocumentVersionListContract } from './get-term-document-version-list/get-term-document-version-list.contract';
import { GetTermDocumentVersionListRequestDto } from './get-term-document-version-list/get-term-document-version-list.request.dto';
import { GetTermDocumentVersionListResponseDto } from './get-term-document-version-list/get-term-document-version-list.response.dto';
import { ScheduleTermDocumentTerminationContract } from './schedule-term-document-termination/schedule-term-document-termination.contract';
import { ScheduleTermDocumentTerminationRequestDto } from './schedule-term-document-termination/schedule-term-document-termination.request.dto';
import { ScheduleTermDocumentTerminationResponseDto } from './schedule-term-document-termination/schedule-term-document-termination.response.dto';
import { UpdateTermDocumentVersionContract } from './update-term-document-version/update-term-document-version.contract';
import { UpdateTermDocumentVersionRequestDto } from './update-term-document-version/update-term-document-version.request.dto';
import { UpdateTermDocumentVersionResponseDto } from './update-term-document-version/update-term-document-version.response.dto';

@Controller('terms')
export class TermsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Post('documents')
  @SwaggerResponse(CreateTermDocumentResponseDto)
  async createTermsDocument(
    @Body() body: CreateTermDocumentRequestDto,
  ): Promise<CreateTermDocumentResponseDto> {
    return this.commandBus.execute(new CreateTermDocumentContract(body));
  }

  @Post('documents/:documentId/versions')
  @SwaggerResponse(CreateTermDocumentVersionResponseDto)
  async createTermsDocumentVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() body: CreateTermDocumentVersionRequestDto,
  ): Promise<CreateTermDocumentVersionResponseDto> {
    return this.commandBus.execute(new CreateTermDocumentVersionContract(documentId, body));
  }

  @Delete('documents/:documentId')
  @SwaggerResponse(DeleteTermDocumentResponseDto)
  async deleteTermsDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<DeleteTermDocumentResponseDto> {
    return this.commandBus.execute(new DeleteTermDocumentContract({ id: documentId } satisfies DeleteTermDocumentRequestDto));
  }

  @Put('documents/:documentId/termination')
  @SwaggerResponse(ScheduleTermDocumentTerminationResponseDto)
  async scheduleTermsDocumentTermination(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() body: ScheduleTermDocumentTerminationRequestDto,
  ): Promise<ScheduleTermDocumentTerminationResponseDto> {
    return this.commandBus.execute(new ScheduleTermDocumentTerminationContract(documentId, body));
  }

  @Delete('documents/:documentId/termination')
  @SwaggerResponse(CancelTermDocumentTerminationResponseDto)
  async cancelTermsDocumentTermination(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<CancelTermDocumentTerminationResponseDto> {
    return this.commandBus.execute(new CancelTermDocumentTerminationContract(documentId));
  }

  @Delete('documents/:documentId/versions/:versionId')
  @SwaggerResponse(DeleteTermDocumentVersionResponseDto)
  async deleteTermsDocumentVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
  ): Promise<DeleteTermDocumentVersionResponseDto> {
    return this.commandBus.execute(new DeleteTermDocumentVersionContract(documentId, versionId));
  }

  @Put('documents/:documentId/versions/:versionId')
  @SwaggerResponse(UpdateTermDocumentVersionResponseDto)
  async updateTermsDocumentVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() body: UpdateTermDocumentVersionRequestDto,
  ): Promise<UpdateTermDocumentVersionResponseDto> {
    return this.commandBus.execute(new UpdateTermDocumentVersionContract(documentId, versionId, body));
  }
}
