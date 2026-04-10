import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'outbox' })
export class Outbox {
  @PrimaryKey()
  id!: string;

  @Property()
  eventType!: string;

  @Property({ type: 'json' })
  payload!: any;

  @Property()
  processed: boolean = false;

  @Property()
  createdAt: Date = new Date();
}
