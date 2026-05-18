import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';

import { ResourceResponseDto, RoleResponseDto, UpdateRolePermissionsDto } from './dto/rbac.dto';
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

  @Get('roles')
  @CheckPermissions('ROLE:READ')
  @ApiOperation({
    summary: '역할 목록 조회',
    description: '시스템 내에 등록된 모든 플랫폼 및 조직 범위의 역할 목록을 조회합니다.',
  })
  @SwaggerResult([RoleResponseDto])
  async getRoles() {
    return this.rbacClient.getRoles();
  }

  @Get('matrix')
  @CheckPermissions('ROLE:READ')
  @ApiOperation({
    summary: '역할별 권한 매핑 매트릭스 전체 조회',
    description: '시스템 내의 모든 역할에 매핑되어 있는 활성 권한 코드 목록을 전체 조회합니다.',
  })
  @SwaggerResult(Object)
  async getRolePermissionsMatrix() {
    return this.rbacClient.getRolePermissionsMatrix();
  }

  @Get('matrix/resources')
  @CheckPermissions('ROLE:READ')
  @ApiOperation({
    summary: '역할-자원-권한 매트릭스 전체 조회',
    description: '모든 역할에 대해 자원별로 매핑된 권한 코드를 조회합니다.',
  })
  @SwaggerResult(Object)
  async getRoleResourcePermissionsMatrix() {
    return this.rbacClient.getRoleResourcePermissionsMatrix();
  }

  @Put('roles/:roleCode/permissions')
  @CheckPermissions('ROLE:UPDATE')
  @ApiOperation({
    summary: '역할별 권한 매핑 정보 업데이트',
    description: '특정 역할에 부여할 모든 권한 코드 배열을 전달받아 기존 권한 매핑을 원자적으로 갱신(Upsert/Delete)합니다.',
  })
  @SwaggerResult(Boolean)
  async updateRolePermissions(
    @Param('roleCode') roleCode: string,
    @Body() data: UpdateRolePermissionsDto,
  ) {
    return this.rbacClient.updateRolePermissions(roleCode, data);
  }
}
