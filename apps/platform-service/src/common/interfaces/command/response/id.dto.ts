import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withCommandIdResponse<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '식별자',
      type: String,
    })
    id!: string;
  }

  return MixinClass;
}

export type CommandIdResponse<TBase extends Type = Type>
  = InstanceType<ReturnType<typeof withCommandIdResponse<TBase>>>;
