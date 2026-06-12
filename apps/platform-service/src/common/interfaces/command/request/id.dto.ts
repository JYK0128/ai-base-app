import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withCommandIdRequest<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    [key: string]: unknown

    @ApiProperty({
      description: '식별자',
    })
    id!: string;
  }

  return MixinClass;
}

export type CommandIdRequest<TBase extends Type> = InstanceType<
  ReturnType<typeof withCommandIdRequest<TBase>>
>;
