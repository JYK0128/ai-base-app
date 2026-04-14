import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['locale', 'namespace', 'key'] })
export class Message extends CoreEntity {
  @Property()
  locale!: string;

  @Property()
  namespace!: string;

  @Property()
  key!: string;

  @Property({ type: 'text' })
  message!: string;
}
