import { ApiProperty } from '@nestjs/swagger';
import { Resource } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateIf, ValidateNested } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

class UpdateResourceSortItemDto extends EntityRequestType(Resource) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', type: String, description: '리소스 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiProperty({ example: 1, type: Number, description: '정렬 순서' })
  @Type(() => Number)
  @IsInt()
  override sortOrder!: number;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', type: String, nullable: true, description: '부모 리소스 식별자' })
  @Type(() => String)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  override parent!: string | null;
}

export class UpdateResourceSortRequestDto extends EntityRequestType(Resource) {
  @ApiProperty({ example: [{ id: '019e5236-adae-70d7-a8f7-2dc90bdf7098', sortOrder: 1, parent: null }], type: () => [UpdateResourceSortItemDto], description: '정렬 대상 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateResourceSortItemDto)
  items!: UpdateResourceSortItemDto[];
}
