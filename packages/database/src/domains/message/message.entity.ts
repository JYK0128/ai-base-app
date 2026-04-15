import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['locale', 'namespace', 'key'] })
export class Message extends BaseEntity {
  @Property()
  locale!: string;

  @Property()
  namespace!: string;

  @Property()
  key!: string;

  @Property({ type: 'text' })
  message!: string;
}
