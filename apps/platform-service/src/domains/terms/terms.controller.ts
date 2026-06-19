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
        content: v.content,
        checksum: v.checksum,
        status: v.status as any,
        effectiveAt: v.effectiveAt as any,
        versionLabel: v.versionLabel,
      })),
      currentVersion: current ? {
        id: current.id,
        content: current.content,
        checksum: current.checksum,
        status: current.status as any,
        effectiveAt: current.effectiveAt as any,
        versionLabel: current.versionLabel,
      } : null,
    };
  }

  @Get('documents/:id/versions')
  @ApiOperation({
    summary: '약관 버전 목록 조회',
    description: '약관 문서의 버전 목록을 조회합니다.',
    operationId: 'TermsController_getTermsDocumentVersions_v1',
  })
  @ApiOkResponse({ type: [TermsVersionResponseDto] })
  async getTermsDocumentVersions(
    @Param('id') id: string,
    @Query() query: GetTermsDocumentVersionsQueryDto,
  ): Promise<TermsVersionResponseDto[]> {
    const versionsReq = new GetTermsDocumentVersionsRequestDto();
    const results = await this.queryBus.execute(new GetTermsDocumentVersionsContract(id, versionsReq));
    return results.map(v => ({
      id: v.id,
      content: v.content,
      checksum: v.checksum,
      status: v.status as any,
      effectiveAt: v.effectiveAt as any,
      versionLabel: v.versionLabel,
    }));
  }

  @Post('documents')
  @ApiOperation({
    summary: '약관 문서 생성',
    description: '약관 문서를 생성합니다.',
    operationId: 'TermsController_createTermsDocument_v1',
  })
  @ApiOkResponse({ type: TermsDocumentResponseDto })
  async createTermsDocument(
    @Body() body: CreateTermsDocumentDto,
  ): Promise<TermsDocumentResponseDto> {
    const req = new CreateTermsDocumentRequestDto();
    req.code = body.code;
    req.title = body.title;
    req.required = body.required;
    req.scope = body.scope as any;
    const result = await this.commandBus.execute(new CreateTermsDocumentContract(req));
    return {
      id: result.id,
      code: body.code,
      title: body.title,
      required: body.required,
      status: 'DRAFT' as any,
    };
  }

  @Post('documents/deprecate')
  @ApiOperation({
    summary: '약관 문서 폐기',
    description: '약관 문서를 폐기하거나 예약 폐기합니다.',
    operationId: 'TermsController_deprecateTermsDocument_v1',
  })
  @ApiOkResponse({ type: TermsDocumentResponseDto })
  async deprecateTermsDocument(
    @Body() body: DeprecateTermsDocumentDto,
  ): Promise<TermsDocumentResponseDto> {
    const req = new DeprecateTermsDocumentRequestDto();
    req.id = body.id;
    req.terminatedAt = new Date(body.deprecatedAt);
    const result = await this.commandBus.execute(new DeprecateTermsDocumentContract(req));
    return {
      id: result.id,
      code: '',
      title: '',
      required: false,
      status: 'TERMINATED' as any,
    };
  }

  @Post('documents/cancel-deprecation')
  @ApiOperation({
    summary: '폐기 예약 취소',
    description: '약관 문서의 폐기 예약을 취소합니다.',
    operationId: 'TermsController_cancelDeprecationTermsDocument_v1',
  })
  @ApiOkResponse({ type: TermsDocumentResponseDto })
  async cancelDeprecationTermsDocument(
    @Body() body: CancelDeprecationTermsDocumentDto,
  ): Promise<TermsDocumentResponseDto> {
    const req = new CancelDeprecationTermsDocumentRequestDto();
    req.id = body.id;
    const result = await this.commandBus.execute(new CancelDeprecationTermsDocumentContract(req));
    return {
      id: result.id,
      code: '',
      title: '',
      required: false,
      status: 'PUBLISHED' as any,
    };
  }

  @Post('documents/delete')
  @ApiOperation({
    summary: '약관 문서 물리 삭제',
    description: '현재 효력 중인 버전이 없을 때 약관 문서를 물리 삭제합니다.',
    operationId: 'TermsController_deleteTermsDocument_v1',
  })
  async deleteTermsDocument(
    @Body() body: DeleteTermsDocumentDto,
  ): Promise<void> {
    const req = new DeleteTermsDocumentRequestDto();
    req.id = body.id;
    await this.commandBus.execute(new DeleteTermsDocumentContract(req));
  }

  @Post('versions')
  @ApiOperation({
    summary: '약관 버전 생성',
    description: '약관 버전을 생성합니다.',
    operationId: 'TermsController_createTermsVersion_v1',
  })
  @ApiOkResponse({ type: TermsVersionResponseDto })
  async createTermsVersion(
    @Body() body: CreateTermsVersionDto,
  ): Promise<TermsVersionResponseDto> {
    const req = new CreateTermsVersionRequestDto();
    req.termsDocumentId = body.termsDocumentId;
    req.label = body.label;
    req.content = body.content;
    req.effectiveAt = body.effectiveAt;
    req.status = body.status as any;
    const result = await this.commandBus.execute(new CreateTermsVersionContract(req));
    return {
      id: result.id,
      content: body.content,
      checksum: '',
      status: body.status as any,
      effectiveAt: body.effectiveAt,
      versionLabel: body.label,
    };
  }

  @Post('versions/update')
  @ApiOperation({
    summary: '약관 버전 수정',
    description: '약관 버전을 수정합니다.',
    operationId: 'TermsController_updateTermsVersion_v1',
  })
  @ApiOkResponse({ type: TermsVersionResponseDto })
  async updateTermsVersion(
    @Body() body: UpdateTermsVersionDto,
  ): Promise<TermsVersionResponseDto> {
    const req = new UpdateTermsVersionRequestDto();
    req.id = body.id;
    req.label = body.label;
    req.content = body.content;
    req.effectiveAt = body.effectiveAt;
    req.status = body.status as any;
    const result = await this.commandBus.execute(new UpdateTermsVersionContract(req));
    return {
      id: result.id,
      content: body.content,
      checksum: '',
      status: body.status as any,
      effectiveAt: body.effectiveAt,
      versionLabel: body.label,
    };
  }
}
