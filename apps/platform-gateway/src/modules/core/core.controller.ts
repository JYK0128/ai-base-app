import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';

import { CoreClient } from './core.client';
import { AgreeTermsDto, CreateAnnouncementDto, CreateTermsDocumentDto, CreateTermsVersionDto, GetAnnouncementsQueryDto, GetOrganizationsQueryDto, GetTermsQueryDto, GetTicketsQueryDto } from './dto/core-request.dto';
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
  @CheckPermissions('platform:organization:read')
  @ApiOperation({ summary: '조직 목록 조회', description: '플랫폼의 모든 조직 목록을 조회합니다.' })
  @SwaggerResult([OrganizationResponseDto])
  async getOrganizations(@Query() query: GetOrganizationsQueryDto) {
    return this.coreClient.getOrganizations({ status: query.status });
  }

  @Patch('organizations/:id/approve')
  @CheckPermissions('platform:organization:approve')
  @ApiOperation({ summary: '조직 승인', description: '가입 대기 중인 조직을 승인합니다.' })
  @SwaggerResult()
  async approveOrganization(@Param('id') id: string) {
    return this.coreClient.approveOrganization(id, true);
  }

  @Patch('organizations/:id/reject')
  @CheckPermissions('platform:organization:approve')
  @ApiOperation({ summary: '조직 거절', description: '가입 대기 중인 조직을 거절합니다.' })
  @SwaggerResult()
  async rejectOrganization(@Param('id') id: string) {
    return this.coreClient.approveOrganization(id, false);
  }

  // --- Announcements ---

  @Get('announcements')
  @CheckPermissions('platform:announcement:read')
  @ApiOperation({ summary: '공지사항 조회', description: '플랫폼 공지사항 목록을 조회합니다.' })
  @SwaggerResult([AnnouncementResponseDto])
  async getAnnouncements(@Query() query: GetAnnouncementsQueryDto) {
    return this.coreClient.getAnnouncements({ isPublishedOnly: query.isPublishedOnly });
  }

  @Post('announcements')
  @CheckPermissions('platform:announcement:manage')
  @ApiOperation({ summary: '공지사항 작성', description: '새로운 공지사항을 작성합니다.' })
  @SwaggerResult(AnnouncementResponseDto)
  async createAnnouncement(@Body() data: CreateAnnouncementDto) {
    return this.coreClient.createAnnouncement(this.cls.get('id'), data);
  }

  // --- Support ---

  @Get('support/tickets')
  @CheckPermissions('platform:support:read')
  @ApiOperation({ summary: '고객지원 티켓 조회', description: '플랫폼 고객지원 티켓 목록을 조회합니다.' })
  @SwaggerResult([TicketResponseDto])
  async getTickets(@Query() query: GetTicketsQueryDto) {
    return this.coreClient.getTickets({
      organizationId: query.organizationId,
      status: query.status,
    });
  }

  // --- Terms ---

  @Get('terms')
  @CheckPermissions('platform:terms:read')
  @ApiOperation({ summary: '약관 목록 조회', description: '플랫폼/조직 범위의 현재 활성 약관 목록을 조회합니다.' })
  @SwaggerResult([TermsDocumentResponseDto])
  async getActiveTerms(@Query() query: GetTermsQueryDto) {
    return this.coreClient.getActiveTerms(query.organizationId);
  }

  @Post('terms/documents')
  @CheckPermissions('platform:terms:manage')
  @ApiOperation({ summary: '약관 문서 생성', description: 'PLATFORM 또는 ORGANIZATION 그룹 약관 문서를 생성합니다.' })
  @SwaggerResult(TermsDocumentResponseDto)
  async createTermsDocument(@Body() data: CreateTermsDocumentDto) {
    return this.coreClient.createTermsDocument(data);
  }

  @Post('terms/versions')
  @CheckPermissions('platform:terms:manage')
  @ApiOperation({ summary: '약관 버전 생성', description: '약관 버전을 생성하고 선택적으로 즉시 게시합니다.' })
  @SwaggerResult(TermsVersionResponseDto)
  async createTermsVersion(@Body() data: CreateTermsVersionDto) {
    return this.coreClient.createTermsVersion(data);
  }

  @Post('terms/agreements')
  @CheckPermissions('platform:terms:agree')
  @ApiOperation({ summary: '약관 동의 저장', description: '매니저의 특정 약관 버전 동의 이력을 저장합니다.' })
  @SwaggerResult(ManagerTermsConsentResponseDto)
  async agreeTerms(@Body() data: AgreeTermsDto) {
    return this.coreClient.agreeTerms(data);
  }
}
