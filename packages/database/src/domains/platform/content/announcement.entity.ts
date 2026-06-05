import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { AnnouncementRepository } from './announcement.repository';

@Entity({ schema: 'platform', repository: () => AnnouncementRepository })
export class Announcement
  extends CoreEntity<Announcement, 'isPublished'> {
  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  isPublished: boolean = false;

  @ManyToOne(() => Member)
  author!: Rel<Member>;
}
