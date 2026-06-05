import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { AgreeTermsDto, CancelDeprecationTermsDocumentDto, CreateTermsDocumentDto, CreateTermsVersionDto, DeleteTermsDocumentDto, DeprecateTermsDocumentDto, GetTermsDocumentsQueryDto, GetTermsDocumentVersionsQueryDto, MemberTermsConsentResponseDto, TermsDocumentDetailResponseDto, TermsDocumentParamDto, TermsDocumentResponseDto, TermsVersionResponseDto, UpdateTermsVersionDto } from './dto';
import { TermsClient } from './terms.client';

@ApiTags('Terms')
@ApiBearerAuth()
@Controller('terms')
export class TermsController {
  constructor(private readonly termsClient: TermsClient) {}

  @Get()
  @CheckPermissions('TERMS:READ')
  @ApiOperation({ summary: '약관 목록 조회', description: '약관 목록을 조회합니다.' })
  @SwaggerResult([TermsDocumentResponseDto])
  async getActiveTerms() {
    const result = await this.termsClient.getActiveTerms();
    return ApiResponse.success(result, '약관 목록을 조회했습니다.');
  }

  @Get('documents')
  @CheckPermissions('TERMS:READ')
  @ApiOperation({ summary: '약관 문서 목록 조회', description: '관리자용 약관 문서 목록을 조회합니다.' })
  @SwaggerResult([TermsDocumentResponseDto])
  async getTermsDocuments(@Query() query: GetTermsDocumentsQueryDto) {
    const result = await this.termsClient.getTermsDocuments(query);
    return ApiResponse.success(result, '약관 문서 목록을 조회했습니다.');
  }

  @Get('documents/:id')
  @CheckPermissions('TERMS:READ')
  @ApiOperation({ summary: '약관 문서 상세 조회', description: '약관 문서 상세를 조회합니다.' })
  @SwaggerResult(TermsDocumentDetailResponseDto)
  async getTermsDocument(@Param() params: TermsDocumentParamDto) {
    const result = await this.termsClient.getTermsDocument(params.id);
    return ApiResponse.success(result, '약관 문서 상세를 조회했습니다.');
  }

  @Get('documents/:id/versions')
  @CheckPermissions('TERMS:READ')
  @ApiOperation({ summary: '약관 버전 목록 조회', description: '약관 문서의 버전 목록을 조회합니다.' })
  @SwaggerResult([TermsVersionResponseDto])
  async getTermsDocumentVersions(
    @Param() params: TermsDocumentParamDto,
    @Query() query: GetTermsDocumentVersionsQueryDto,
  ) {
    const result = await this.termsClient.getTermsDocumentVersions(params.id, query.keyword);
    return ApiResponse.success(result, '약관 버전 목록을 조회했습니다.');
  }

  @Post('documents')
  @CheckPermissions('TERMS:CREATE')
  @ApiOperation({ summary: '약관 문서 생성', description: '약관 문서를 생성합니다.' })
  @SwaggerResult(TermsDocumentResponseDto)
  async createTermsDocument(@Body() data: CreateTermsDocumentDto) {
    const result = await this.termsClient.createTermsDocument(data);
    return ApiResponse.success(result, '약관 문서를 생성했습니다.');
  }

  @Post('documents/deprecate')
  @CheckPermissions('TERMS:UPDATE')
  @ApiOperation({ summary: '약관 문서 폐기', description: '약관 문서를 폐기하거나 예약 폐기합니다.' })
  @SwaggerResult(TermsDocumentResponseDto)
  async deprecateTermsDocument(@Body() data: DeprecateTermsDocumentDto) {
    const result = await this.termsClient.deprecateTermsDocument(data);
    return ApiResponse.success(result, '약관 문서를 폐기했습니다.');
  }

  @Post('documents/cancel-deprecation')
  @CheckPermissions('TERMS:UPDATE')
  @ApiOperation({ summary: '폐기 예약 취소', description: '약관 문서의 폐기 예약을 취소합니다.' })
  @SwaggerResult(TermsDocumentResponseDto)
  async cancelDeprecationTermsDocument(@Body() data: CancelDeprecationTermsDocumentDto) {
    const result = await this.termsClient.cancelDeprecationTermsDocument(data);
    return ApiResponse.success(result, '폐기 예약을 취소했습니다.');
  }

  @Post('documents/delete')
  @CheckPermissions('TERMS:DELETE')
  @ApiOperation({ summary: '약관 문서 물리 삭제', description: '현재 효력 중인 버전이 없을 때 약관 문서를 물리 삭제합니다.' })
  @SwaggerResult()
  async deleteTermsDocument(@Body() data: DeleteTermsDocumentDto) {
    const result = await this.termsClient.deleteTermsDocument(data);
    return ApiResponse.success(result, '약관 문서를 삭제했습니다.');
  }

  @Post('versions')
  @CheckPermissions('TERMS:CREATE')
  @ApiOperation({ summary: '약관 버전 생성', description: '약관 버전을 생성합니다.' })
  @SwaggerResult(TermsVersionResponseDto)
  async createTermsVersion(@Body() data: CreateTermsVersionDto) {
    const result = await this.termsClient.createTermsVersion(data);
    return ApiResponse.success(result, '약관 버전을 생성했습니다.');
  }

  @Post('versions/update')
  @CheckPermissions('TERMS:UPDATE')
  @ApiOperation({ summary: '약관 버전 수정', description: '약관 버전을 수정합니다.' })
  @SwaggerResult(TermsVersionResponseDto)
  async updateTermsVersion(@Body() data: UpdateTermsVersionDto) {
    const result = await this.termsClient.updateTermsVersion(data);
    return ApiResponse.success(result, '약관 버전을 수정했습니다.');
  }

  @Post('agreements')
  @CheckPermissions('TERMS:UPDATE')
  @ApiOperation({ summary: '약관 동의 저장', description: '약관 동의 이력을 저장합니다.' })
  @SwaggerResult(MemberTermsConsentResponseDto)
  async agreeTerms(@Body() data: AgreeTermsDto) {
    const result = await this.termsClient.agreeTerms(data);
    return ApiResponse.success(result, '약관 동의를 저장했습니다.');
  }
}
