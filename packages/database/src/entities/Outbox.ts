import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ schema: 'platform' })
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
