import { EntityRepository } from '@mikro-orm/postgresql';

import { Announcement } from './announcement.entity';

export class AnnouncementRepository extends EntityRepository<Announcement> {}
