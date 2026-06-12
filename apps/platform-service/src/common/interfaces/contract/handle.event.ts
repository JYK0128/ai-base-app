import type { Type } from '@nestjs/common';
import type { IEvent } from '@nestjs/cqrs';

import type { EntityRequestDto } from '../request/entity.request.dto';

export abstract class HandleEvent<TEvent extends Type> implements IEvent {
  constructor(public readonly event: EntityRequestDto<TEvent>) {}
}
