import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withIdResponseDto<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '식별자',
      type: String,
    })
    id!: string;
  }

  return MixinClass;
}

export type IdResponseDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withIdResponseDto<TEntity>>>;
