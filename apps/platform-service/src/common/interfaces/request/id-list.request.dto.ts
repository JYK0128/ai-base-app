import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withIdListRequestDto<TBase extends Type>(_Base: TBase) {
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

export type IdListRequestDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withIdListRequestDto<TEntity>>>;
