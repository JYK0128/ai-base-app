import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { GetTicketsQueryDto, TicketResponseDto } from './dto';
import { SupportClient } from './support.client';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportClient: SupportClient) {}

  @Get('tickets')
  @CheckPermissions('SUPPORT:READ')
  @ApiOperation({ summary: '티켓 조회', description: '티켓 목록을 조회합니다.' })
  @SwaggerResult([TicketResponseDto])
  async getTickets(@Query() query: GetTicketsQueryDto) {
    const result = await this.supportClient.getTickets({
      organizationId: query.organizationId,
      status: query.status,
    });
    return ApiResponse.success(result, '고객지원 티켓 목록을 조회했습니다.');
  }
}
