import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { AuthSeeder } from './AuthSeeder';
import { MessageSeeder } from './MessageSeeder';
import { OrganizationSeeder } from './OrganizationSeeder';
import { RbacSeeder } from './RbacSeeder';
import { SiteSeeder } from './SiteSeeder';

export class PlatformSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [OrganizationSeeder, SiteSeeder, RbacSeeder, MessageSeeder, AuthSeeder]);
  }
}
