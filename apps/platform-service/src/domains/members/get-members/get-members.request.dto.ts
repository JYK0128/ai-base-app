import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '@pkg/database';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import type { MemberRoleDto } from '../members.types';

export class GetMembersRequestDto {
  @ApiPropertyOptional({ example: 'kim', description: '검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatus, example: 'ACTIVE', description: '멤버 상태' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ example: 'MANAGER', description: '조직 역할' })
  @IsOptional()
  @IsString()
  role?: MemberRoleDto;
}
