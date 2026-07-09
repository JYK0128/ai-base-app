import { ApiProperty } from '@nestjs/swagger';

export abstract class IdListResponseDto<_TEntity extends object> {
  @ApiProperty({ type: String, isArray: true, description: '식별자 목록' })
  ids!: string[];
}
