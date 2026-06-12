import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Resource, ResourceScope, ResourceType } from '@pkg/database';

export class ResourceDetailResponseDto implements Pick<Resource, 'id' | 'code' | 'name' | 'type' | 'scope' | 'path' | 'icon' | 'sortOrder' | 'actions' | 'constraint'> {
  constructor(resource: Pick<Resource, 'id' | 'code' | 'name' | 'type' | 'scope' | 'path' | 'icon' | 'sortOrder' | 'actions' | 'constraint'> & { parentId?: string }) {
    this.id = resource.id;
    this.code = resource.code;
    this.name = resource.name;
    this.type = resource.type;
    this.scope = resource.scope;
    this.path = resource.path;
    this.icon = resource.icon;
    this.sortOrder = resource.sortOrder;
    this.actions = resource.actions;
    this.constraint = resource.constraint;
    this.parentId = resource.parentId;
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
  parentId?: string;
}
