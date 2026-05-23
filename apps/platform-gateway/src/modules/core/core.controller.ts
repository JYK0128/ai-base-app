import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { CoreClient } from './core.client';
import { AgreeTermsDto, CreateAnnouncementDto, CreateTermsDocumentDto, CreateTermsVersionDto, GetAnnouncementsQueryDto, GetOrganizationsQueryDto, GetTermsQueryDto, GetTicketsQueryDto, OrganizationParamDto } from './dto/core-request.dto';
import { AnnouncementResponseDto, ManagerTermsConsentResponseDto, OrganizationResponseDto, TermsDocumentResponseDto, TermsVersionResponseDto, TicketResponseDto } from './dto/core-response.dto';

@ApiTags('Core')
@ApiBearerAuth()
@Controller()
export class CoreController {
  constructor(
    private readonly coreClient: CoreClient,
    private readonly cls: ClsService,
  ) {}

  // --- Organizations ---

  @Get('organizations')
  @CheckPermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: '조직 목록 조회', description: '조직 목록을 조회합니다.' })
  @SwaggerResult([OrganizationResponseDto])
  async getOrganizations(@Query() query: GetOrganizationsQueryDto) {
    const result = await this.coreClient.getOrganizations({ status: query.status });
    return ApiResponse.success(result, '조직 목록을 조회했습니다.');
  }

  @Patch('organizations/:id/approve')
  @CheckPermissions('ORGANIZATION:UPDATE')
  @ApiOperation({ summary: '조직 승인', description: '조직을 승인합니다.' })
  @SwaggerResult()
  async approveOrganization(@Param() params: OrganizationParamDto) {
    const result = await this.coreClient.approveOrganization(params.id, true);
    return ApiResponse.success(result, '조직을 승인했습니다.');
  }

  @Patch('organizations/:id/reject')
  @CheckPermissions('ORGANIZATION:UPDATE')
  @ApiOperation({ summary: '조직 거절', description: '조직을 거절합니다.' })
  @SwaggerResult()
  async rejectOrganization(@Param() params: OrganizationParamDto) {
    const result = await this.coreClient.approveOrganization(params.id, false);
    return ApiResponse.success(result, '조직을 거절했습니다.');
  }

  // --- Announcements ---

  @Get('announcements')
  @CheckPermissions('ANNOUNCEMENT:READ')
  @ApiOperation({ summary: '공지사항 조회', description: '공지사항 목록을 조회합니다.' })
  @SwaggerResult([AnnouncementResponseDto])
  async getAnnouncements(@Query() query: GetAnnouncementsQueryDto) {
    const result = await this.coreClient.getAnnouncements({ isPublishedOnly: query.isPublishedOnly });
    return ApiResponse.success(result, '공지사항 목록을 조회했습니다.');
  }

  @Post('announcements')
  @CheckPermissions('ANNOUNCEMENT:CREATE')
  @ApiOperation({ summary: '공지사항 작성', description: '공지사항을 작성합니다.' })
  @SwaggerResult(AnnouncementResponseDto)
  async createAnnouncement(@Body() data: CreateAnnouncementDto) {
    const result = await this.coreClient.createAnnouncement(this.cls.get('id'), data);
    return ApiResponse.success(result, '공지사항을 작성했습니다.');
  }

  // --- Support ---

  @Get('support/tickets')
  @CheckPermissions('SUPPORT:READ')
  @ApiOperation({ summary: '티켓 조회', description: '티켓 목록을 조회합니다.' })
  @SwaggerResult([TicketResponseDto])
  async getTickets(@Query() query: GetTicketsQueryDto) {
    const result = await this.coreClient.getTickets({
      organizationId: query.organizationId,
      status: query.status,
    });
    return ApiResponse.success(result, '고객지원 티켓 목록을 조회했습니다.');
  }

  // --- Terms ---

  @Get('terms')
  @CheckPermissions('TERMS:READ')
  @ApiOperation({ summary: '약관 목록 조회', description: '약관 목록을 조회합니다.' })
  @SwaggerResult([TermsDocumentResponseDto])
  async getActiveTerms(@Query() query: GetTermsQueryDto) {
    const result = await this.coreClient.getActiveTerms(query.organizationId);
    return ApiResponse.success(result, '약관 목록을 조회했습니다.');
  }

  @Post('terms/documents')
  @CheckPermissions('TERMS:CREATE')
  @ApiOperation({ summary: '약관 문서 생성', description: '약관 문서를 생성합니다.' })
  @SwaggerResult(TermsDocumentResponseDto)
  async createTermsDocument(@Body() data: CreateTermsDocumentDto) {
    const result = await this.coreClient.createTermsDocument(data);
    return ApiResponse.success(result, '약관 문서를 생성했습니다.');
  }

  @Post('terms/versions')
  @CheckPermissions('TERMS:CREATE')
  @ApiOperation({ summary: '약관 버전 생성', description: '약관 버전을 생성합니다.' })
  @SwaggerResult(TermsVersionResponseDto)
  async createTermsVersion(@Body() data: CreateTermsVersionDto) {
    const result = await this.coreClient.createTermsVersion(data);
    return ApiResponse.success(result, '약관 버전을 생성했습니다.');
  }

  @Post('terms/agreements')
  @CheckPermissions('TERMS:UPDATE')
  @ApiOperation({ summary: '약관 동의 저장', description: '약관 동의 이력을 저장합니다.' })
  @SwaggerResult(ManagerTermsConsentResponseDto)
  async agreeTerms(@Body() data: AgreeTermsDto) {
    const result = await this.coreClient.agreeTerms(data);
    return ApiResponse.success(result, '약관 동의를 저장했습니다.');
  }
}
