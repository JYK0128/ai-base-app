import type { Opt } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

@Entity({ schema: 'platform' })
export class Outbox extends BaseEntity {
  @Property()
  eventType!: string;

  @Property({ type: 'json' })
  payload!: Record<string, unknown>;

  @Property()
  processed: boolean & Opt = false;
}
