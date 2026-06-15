import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Resource, ResourceScope, ResourceType } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetResourceResponseDto implements EntityResponseDto<Resource> {
  constructor(resource: Resource) {
    this.id = resource.id;
    this.code = resource.code;
    this.name = resource.name;
    this.type = resource.type;
    this.scope = resource.scope;
    if (resource.path !== undefined) {
      this.path = resource.path;
    }
    if (resource.icon !== undefined) {
      this.icon = resource.icon;
    }
    if (resource.sortOrder !== undefined) {
      this.sortOrder = resource.sortOrder;
    }
    this.actions = resource.actions;
    if (resource.constraint !== undefined) {
      this.constraint = resource.constraint;
    }
    this.children = [];
    if (resource.parent?.id !== undefined) {
      this.parent = resource.parent.id;
    }
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  id!: string;

  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  name!: string;

  @ApiProperty({ enum: ResourceType, example: 'MENU', description: '리소스 유형' })
  type!: ResourceType;

  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  scope!: ResourceScope;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'dashboard', description: '아이콘' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '리소스 액션 목록' })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  constraint?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', description: '부모 리소스 식별자' })
  parent?: string;

  @ApiProperty({ type: () => [GetResourceResponseDto], description: '하위 리소스 목록' })
  children!: GetResourceResponseDto[];
}
