import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetAnnouncementsRequestDto {
  @ApiPropertyOptional({
    description: '게시된 공지만 조회할지 여부',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPublishedOnly?: boolean;
}
