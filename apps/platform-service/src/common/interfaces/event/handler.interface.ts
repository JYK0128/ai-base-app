import type { Type } from '@nestjs/common';

import type { EventDataRequest } from './request/data.interface';

export interface IEventHandler<TEvent extends Type> {
  handle(event: EventDataRequest<TEvent>): void | Promise<void>
}
