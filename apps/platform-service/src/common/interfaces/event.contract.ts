import type { Type } from '@nestjs/common';

import type { EntityRequestDto } from './request/entity.request.dto';

export interface IEventHandler<TEvent extends Type> {
  handle(event: EntityRequestDto<TEvent>): void | Promise<void>
}
