import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { OrganizationSeeder } from './organization.seeder';
import { PlatformSeeder } from './platform.seeder';

/**
 * DatabaseSeeder
 * 전체 시딩 프로세스를 총괄하며, 의존성 순서에 따라 도메인별 시더를 호출합니다.
 * 1depth 평면 구조와 도메인 기반 명명 규칙을 따릅니다.
 */
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [PlatformSeeder]);
    await this.call(em, [OrganizationSeeder]);
  }
}
