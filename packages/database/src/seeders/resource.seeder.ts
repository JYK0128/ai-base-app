import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Permission } from '@/domains/platform/rbac/permission.entity';
import { Resource, ResourceType } from '@/domains/platform/rbac/resource.entity';

interface ResourceSeedDto {
  code: string
  name: string
  type: ResourceType
  path?: string
  icon?: string
  displayOrder?: number
  httpMethod?: string
  pathPattern?: string
  parentCode?: string
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[]
}

const RESOURCES_SEEDS: ResourceSeedDto[] = [
  // 1. 대시보드
  {
    code: 'DASHBOARD',
    name: '대시보드',
    type: ResourceType.MENU,
    path: '/dashboard',
    icon: 'LayoutDashboard',
    displayOrder: 1,
    actions: ['READ'],
  },
  // 2. 조직 관리
  {
    code: 'ORGANIZATION',
    name: '조직 관리',
    type: ResourceType.MENU,
    path: '/organizations',
    icon: 'Building2',
    displayOrder: 2,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 3. 공지사항 관리
  {
    code: 'ANNOUNCEMENT',
    name: '공지사항 관리',
    type: ResourceType.MENU,
    path: '/announcements',
    icon: 'Megaphone',
    displayOrder: 3,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 4. 고객 지원
  {
    code: 'SUPPORT',
    name: '고객 지원',
    type: ResourceType.MENU,
    path: '/support',
    icon: 'LifeBuoy',
    displayOrder: 4,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 5. 감사 로그
  {
    code: 'AUDIT',
    name: '감사 로그',
    type: ResourceType.MENU,
    path: '/audit',
    icon: 'ScrollText',
    displayOrder: 5,
    actions: ['READ'],
  },
  // 6. 조직 멤버 관리
  {
    code: 'MEMBER',
    name: '조직 멤버 관리',
    type: ResourceType.MENU,
    path: '/members',
    icon: 'Users',
    displayOrder: 6,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 7. 조직 역할 관리
  {
    code: 'ROLE',
    name: '조직 역할 관리',
    type: ResourceType.MENU,
    path: '/roles',
    icon: 'Key',
    displayOrder: 7,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 8. 조직 기본 정보
  {
    code: 'ORG_INFO',
    name: '조직 기본 정보',
    type: ResourceType.MENU,
    path: '/info',
    icon: 'Info',
    displayOrder: 8,
    actions: ['READ', 'UPDATE'],
  },
  // 9. 조직 서비스 데이터
  {
    code: 'SERVICE',
    name: '조직 서비스 데이터',
    type: ResourceType.MENU,
    path: '/service',
    icon: 'Settings',
    displayOrder: 9,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 10. 약관 관리
  {
    code: 'TERMS',
    name: '약관 관리',
    type: ResourceType.MENU,
    path: '/terms',
    icon: 'FileText',
    displayOrder: 10,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
];

export class ResourceSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const createdResources: Record<string, Resource> = {};

    // 1. 최상위 자원 먼저 생성
    for (const seed of RESOURCES_SEEDS.filter((s) => !s.parentCode)) {
      let resource = await em.findOne(Resource, { code: seed.code });
      if (!resource) {
        resource = em.create(Resource, {
          code: seed.code,
          name: seed.name,
          type: seed.type,
          path: seed.path,
          icon: seed.icon,
          displayOrder: seed.displayOrder,
        });
        em.persist(resource);
      }
      createdResources[seed.code] = resource;
    }

    await em.flush();

    // 2. 하위 자원 생성
    for (const seed of RESOURCES_SEEDS.filter((s) => s.parentCode)) {
      const parent = createdResources[seed.parentCode!];
      if (!parent) {
        throw new Error(`Parent resource not found: ${seed.parentCode}`);
      }

      let resource = await em.findOne(Resource, { code: seed.code });
      if (!resource) {
        resource = em.create(Resource, {
          code: seed.code,
          name: seed.name,
          type: seed.type,
          parent,
          httpMethod: seed.httpMethod,
          pathPattern: seed.pathPattern,
        });
        em.persist(resource);
      }
      createdResources[seed.code] = resource;
    }

    await em.flush();

    // 3. 자원별 Permission 생성
    for (const seed of RESOURCES_SEEDS) {
      const resource = createdResources[seed.code];
      for (const action of seed.actions) {
        const code = `${seed.code}:${action}`;
        const exists = await em.findOne(Permission, { code });
        if (!exists) {
          const permission = em.create(Permission, {
            code,
            name: `${seed.name} (${action})`,
            resource,
            action,
          });
          em.persist(permission);
        }
      }
    }

    await em.flush();
  }
}
