import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';

import { ResourceResponseDto } from './dto/rbac.dto';
import { RbacClient } from './rbac.client';

@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacClient: RbacClient) {}

  @Get('resources')
  @CheckPermissions('ROLE:READ')
  @ApiOperation({
    summary: '자원 트리 구조 조회',
    description: '시스템 내의 메뉴 및 API 자원들의 계층 트리 구조와 각 자원별 정의된 권한 목록을 함께 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getResources() {
    return this.rbacClient.getResources();
  }
}
