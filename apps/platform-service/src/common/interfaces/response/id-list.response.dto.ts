import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withIdListResponseDto<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '식별자 목록',
      type: String,
      isArray: true,
    })
    ids!: string[];
  }

  return MixinClass;
}

export type IdListResponseDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withIdListResponseDto<TEntity>>>;
