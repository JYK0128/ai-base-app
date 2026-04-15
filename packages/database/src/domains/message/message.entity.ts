import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { MessageRepository } from './message.repository';

@Entity({ schema: 'platform', repository: () => MessageRepository })
@Unique({ properties: ['locale', 'namespace', 'key'] })
export class Message extends CoreEntity<Message> {
  @Property()
  locale!: string;

  @Property()
  namespace!: string;

  @Property()
  key!: string;

  @Property({ type: 'text' })
  message!: string;
}
