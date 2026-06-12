import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withCommandIdRequest<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '식별자',
    })
    id!: string;
  }

  return MixinClass;
}

export type CommandIdRequest<TEntity extends Type>
  = ReturnType<typeof withCommandIdRequest<TEntity>>;
