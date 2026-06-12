import type { Type } from '@nestjs/common';

import type { EventEntityDataRequest } from './event/event-entity.request';

export interface IEventHandler<TEvent extends Type> {
  handle(event: EventEntityDataRequest<TEvent>): void | Promise<void>
}
