import type { Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ schema: 'platform' })
export class Outbox {
  @PrimaryKey()
  id!: string;

  @Property()
  eventType!: string;

  @Property({ type: 'json' })
  payload!: Record<string, unknown>;

  @Property()
  processed: boolean & Opt = false;

  @Property()
  createdAt: Date & Opt = new Date();
}
