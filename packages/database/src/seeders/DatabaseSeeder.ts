import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { PlatformManagerSeeder } from './platform.manager.seeder';
import { PlatformMessageSeeder } from './platform.message.seeder';
import { PlatformOrganizationSeeder } from './platform.organization.seeder';
import { PlatformRbacSeeder } from './platform.rbac.seeder';
import { SiteSeeder } from './site.seeder';

/**
 * DatabaseSeeder
 * 전체 시딩 프로세스를 총괄하며, 의존성 순서에 따라 도메인별 시더를 호출합니다.
 * 1depth 평면 구조와 도메인 기반 명명 규칙을 따릅니다.
 */
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 1. Core Layer (시스템 기본 인프라)
    await this.call(em, [
      PlatformRbacSeeder,
    ]);

    // 2. Business Layer (핵심 비즈니스 엔티티)
    await this.call(em, [
      PlatformOrganizationSeeder,
      SiteSeeder,
      PlatformManagerSeeder,
    ]);

    // 3. Content Layer (부가 콘텐츠 및 데이터)
    await this.call(em, [
      PlatformMessageSeeder,
    ]);
  }
}
