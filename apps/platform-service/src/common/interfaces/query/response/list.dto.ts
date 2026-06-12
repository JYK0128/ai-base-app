import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withQueryListResponse<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '응답 항목',
      type: Object,
      isArray: true,
    })
    items!: Partial<InstanceType<TBase>>[];
  }

  return MixinClass;
}

export type QueryListResponse<TBase extends Type>
  = InstanceType<ReturnType<typeof withQueryListResponse<TBase>>>;
