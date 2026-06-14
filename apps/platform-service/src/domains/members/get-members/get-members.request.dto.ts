import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Member } from '@pkg/database';
import { MemberStatus } from '@pkg/database';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { type PageRequestDto, SortDirection } from '@/common/interfaces';

export class GetMembersRequestDto implements PageRequestDto<Member> {
  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['createdAt'],
    default: ['createdAt'],
    isArray: true,
  })
  sort!: Array<keyof Member & string>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC],
    default: [SortDirection.DESC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({
    description: '페이지 번호',
    example: 1,
    default: 1,
  })
  page!: number;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    default: 20,
  })
  limit!: number;

  @ApiPropertyOptional({ example: 'kim', description: '검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatus, example: 'ACTIVE', description: '멤버 상태' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({
    example: ['MANAGER'],
    description: '조직 역할 코드 목록',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }

    return value;
  })
  roles?: string[];
}
