import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Resource, ResourceType } from '@/domains/platform/resource/resource.entity';

interface ResourceSeedDto {
  code: string
  name: string
  type: ResourceType
  path?: string
  icon?: string
  sortOrder?: number
  parentCode?: string
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[]
  translations?: Record<string, string>
}

const RESOURCES_SEEDS: ResourceSeedDto[] = [
  // 1. 대시보드
  {
    code: 'DASHBOARD',
    name: '대시보드',
    type: ResourceType.MENU,
    path: '/dashboard',
    icon: 'LayoutDashboard',
    sortOrder: 1,
    actions: ['READ'],
    translations: {
      ko: '대시보드',
      en: 'Dashboard',
      ja: 'ダッシュボード',
      zh: '仪表板',
    },
  },
  // 2. 조직 관리
  {
    code: 'ORGANIZATION',
    name: '조직 관리',
    type: ResourceType.MENU,
    path: '/organizations',
    icon: 'Building2',
    sortOrder: 2,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '조직 관리',
      en: 'Organization Management',
      ja: '組織管理',
      zh: '组织管理',
    },
  },
  // 3. 공지사항 관리
  {
    code: 'ANNOUNCEMENT',
    name: '공지사항 관리',
    type: ResourceType.MENU,
    path: '/announcements',
    icon: 'Megaphone',
    sortOrder: 3,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '공지사항 관리',
      en: 'Announcement Management',
      ja: 'お知らせ管理',
      zh: '公告管理',
    },
  },
  // 4. 고객 지원
  {
    code: 'SUPPORT',
    name: '고객 지원',
    type: ResourceType.MENU,
    path: '/support',
    icon: 'LifeBuoy',
    sortOrder: 4,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '고객 지원',
      en: 'Customer Support',
      ja: 'カスタマーサポート',
      zh: '客户支持',
    },
  },
  // 5. 감사 로그
  {
    code: 'AUDIT',
    name: '감사 로그',
    type: ResourceType.MENU,
    path: '/audit',
    icon: 'ScrollText',
    sortOrder: 5,
    actions: ['READ'],
    translations: {
      ko: '감사 로그',
      en: 'Audit Logs',
      ja: '監査ログ',
      zh: '审计日志',
    },
  },
  // 6. 조직 멤버 관리
  {
    code: 'MEMBER',
    name: '조직 멤버 관리',
    type: ResourceType.MENU,
    path: '/members',
    icon: 'Users',
    sortOrder: 6,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '조직 멤버 관리',
      en: 'Member Management',
      ja: 'メンバー管理',
      zh: '成员管理',
    },
  },
  // 7. 리소스 관리
  {
    code: 'RESOURCE',
    name: '리소스 관리',
    type: ResourceType.MENU,
    path: '/resources',
    icon: 'Key',
    sortOrder: 7,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '리소스 관리',
      en: 'Resource Management',
      ja: 'リソース管理',
      zh: '资源管理',
    },
  },
  {
    code: 'ROLE_RESOURCE_CREATE_BUTTON',
    name: '메뉴 추가 버튼',
    type: ResourceType.COMPONENT,
    parentCode: 'RESOURCE',
    sortOrder: 1,
    actions: ['READ'],
    translations: {
      ko: '메뉴 추가',
      en: 'Add Menu',
      ja: 'メニュー追加',
      zh: '添加菜单',
    },
  },
  {
    code: 'ROLE_RESOURCE_SAVE_BUTTON',
    name: '저장 버튼',
    type: ResourceType.COMPONENT,
    parentCode: 'RESOURCE',
    sortOrder: 2,
    actions: ['READ'],
    translations: {
      ko: '저장',
      en: 'Save',
      ja: '保存',
      zh: '保存',
    },
  },
  // 8. 조직 기본 정보
  {
    code: 'ORG_INFO',
    name: '조직 기본 정보',
    type: ResourceType.MENU,
    path: '/info',
    icon: 'Info',
    sortOrder: 8,
    actions: ['READ', 'UPDATE'],
    translations: {
      ko: '조직 기본 정보',
      en: 'Organization Info',
      ja: '組織基本情報',
      zh: '组织基本信息',
    },
  },
  // 9. 조직 서비스 데이터
  {
    code: 'SERVICE',
    name: '조직 서비스 데이터',
    type: ResourceType.MENU,
    path: '/service',
    icon: 'Settings',
    sortOrder: 9,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '조직 서비스 데이터',
      en: 'Service Data',
      ja: 'サービスデータ',
      zh: '服务数据',
    },
  },
  // 10. 약관 관리
  {
    code: 'TERMS',
    name: '약관 관리',
    type: ResourceType.MENU,
    path: '/terms',
    icon: 'FileText',
    sortOrder: 10,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    translations: {
      ko: '약관 관리',
      en: 'Terms Management',
      ja: '利用規約管理',
      zh: '条款管理',
    },
  },
];

export class ResourceSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const createdResources: Record<string, Resource> = {};

    await this.seedResources(em, createdResources, RESOURCES_SEEDS.filter((seed) => !seed.parentCode));
    await em.flush();

    await this.seedResources(em, createdResources, RESOURCES_SEEDS.filter((seed) => seed.parentCode));
    await em.flush();
  }

  private async seedResources(
    em: EntityManager,
    createdResources: Record<string, Resource>,
    seeds: ResourceSeedDto[],
  ): Promise<void> {
    for (const seed of seeds) {
      const parent = seed.parentCode ? createdResources[seed.parentCode] : undefined;

      if (seed.parentCode && !parent) {
        throw new Error(`Parent resource not found: ${seed.parentCode}`);
      }

      const resource = await this.upsertResource(em, seed, parent);
      createdResources[seed.code] = resource;
    }
  }

  private async upsertResource(
    em: EntityManager,
    seed: ResourceSeedDto,
    parent?: Resource,
  ): Promise<Resource> {
    let resource = await em.findOne(Resource, { code: seed.code });

    if (!resource) {
      resource = em.create(Resource, {
        code: seed.code,
        name: seed.name,
        type: seed.type,
        parent,
        path: seed.path,
        icon: seed.icon,
        sortOrder: seed.sortOrder,
        actions: seed.actions,
        translations: seed.translations,
      });
      em.persist(resource);
      return resource;
    }

    this.updateSeedResource(resource, seed, parent);
    return resource;
  }

  private updateSeedResource(
    resource: Resource,
    seed: ResourceSeedDto,
    parent?: Resource,
  ): void {
    resource.sortOrder = seed.sortOrder;
    resource.actions = seed.actions;
    if (parent !== undefined) {
      resource.parent = parent;
    }

    if (seed.translations) {
      resource.translations = seed.translations;
    }
  }
}
