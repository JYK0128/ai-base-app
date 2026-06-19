import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Resource,
         ResourceAction,
         ResourceScope,
         ResourceType } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetResourceResponseDto implements Omit<
  EntityResponseDto<Resource>,
  'metadata' | 'parent' | 'children'
> {
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
    this.actions = (resource.actions ?? []) as ResourceAction[];
    this.children = [];
    if (resource.parent?.id !== undefined) {
      this.parent = resource.parent.id;
    }
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7098',
    description: '리소스 식별자',
  })
  id!: string;

  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  name!: string;

  @ApiProperty({
    enum: ResourceType,
    example: ResourceType.MENU,
    description: '리소스 유형',
  })
  type!: ResourceType;

  @ApiProperty({
    enum: ResourceScope,
    example: ResourceScope.PLATFORM,
    description: '리소스 관리 범위',
  })
  scope!: ResourceScope;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'dashboard', description: '아이콘' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({
    enum: ResourceAction,
    isArray: true,
    example: [ResourceAction.CREATE, ResourceAction.READ],
    description: '리소스 액션 목록',
  })
  actions!: ResourceAction[];

  @ApiPropertyOptional({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7100',
    description: '부모 리소스 식별자',
  })
  parent?: string;

  @ApiProperty({
    type: () => [GetResourceResponseDto],
    example: [],
    description: '하위 리소스 목록',
  })
  children!: GetResourceResponseDto[];
}
