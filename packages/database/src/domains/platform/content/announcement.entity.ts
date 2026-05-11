import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Manager } from '../manager/manager.entity';
import { AnnouncementRepository } from './announcement.repository';

@Entity({ schema: 'platform', repository: () => AnnouncementRepository })
export class Announcement extends CoreEntity<Announcement> {
  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  isPublished: boolean = false;

  @Index()
  @ManyToOne(() => Manager)
  author!: Rel<Manager>;
}
