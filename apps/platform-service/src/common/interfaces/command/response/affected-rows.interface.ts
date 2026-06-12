import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withCommandAffectedRowsResponse<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '영향받은 행 수',
      type: Number,
    })
    affectedRows!: number;
  }

  return MixinClass;
}

export type CommandAffectedRowsResponse<TBase extends Type = Type>
  = InstanceType<ReturnType<typeof withCommandAffectedRowsResponse<TBase>>>;
