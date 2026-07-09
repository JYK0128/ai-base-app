import { ApiProperty } from '@nestjs/swagger';
import { Resource, ResourceAction, ResourceScope, ResourceType } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
export class AllowedResourceListItem extends EntityResponseType(Resource) {
  constructor(resource: Resource) {
    super();
    this.id = resource.id;
    this.code = resource.code;
    this.name = resource.name;
    this.type = resource.type;
    this.scope = resource.scope;
    this.path = resource.path;
    this.icon = resource.icon;
    this.sortOrder = resource.sortOrder;
    this.actions = (resource.actions ?? []) as ResourceAction[];
    this.children = [];
    this.parent = resource.parent?.id ?? null;
  }

  @ApiProperty({ type: String, description: '리소스 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '리소스 코드' })
  override code!: string;

  @ApiProperty({ type: String, description: '리소스 이름' })
  override name!: string;

  @ApiProperty({ enum: ResourceType, description: '리소스 유형' })
  override type!: ResourceType;

  @ApiProperty({ enum: ResourceScope, description: '리소스 관리 범위' })
  override scope!: ResourceScope;

  @ApiProperty({ type: String, nullable: true, description: '리소스 경로' })
  override path!: string | null;

  @ApiProperty({ type: String, nullable: true, description: '아이콘' })
  override icon!: string | null;

  @ApiProperty({ type: Number, nullable: true, description: '정렬 순서' })
  override sortOrder!: number | null;

  @ApiProperty({ type: String, isArray: true, enum: ResourceAction, description: '리소스 액션 목록' })
  override actions!: ResourceAction[];

  @ApiProperty({ type: String, nullable: true, description: '부모 리소스 식별자' })
  override parent!: string | null;

  @ApiProperty({ type: () => [AllowedResourceListItem], description: '하위 리소스 목록' })
  override children!: AllowedResourceListItem[];
}
export class AllowedResourceListResponseDto extends ListResponseDto<AllowedResourceListItem> {
  constructor(args: AllowedResourceListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [AllowedResourceListItem], description: '권한이 부여된 리소스 목록' })
  items!: AllowedResourceListItem[];
}
