import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { I18nTranslation } from '../domains/platform/i18n/i18n-translation.entity';
import { ResourceScope, ResourceType } from '../domains/platform/resource/resource.constants';
import { Resource } from '../domains/platform/resource/resource.entity';

type ResourcePermissionSeed = Partial<Pick<Resource, 'creatable' | 'readable' | 'updatable' | 'deletable'>>;

interface ResourceSeedDto {
  code: string
  alias: string
  translations?: Record<string, string>
  type: ResourceType
  scope: ResourceScope
  path?: string
  icon?: string
  sortOrder?: number
  permissions: ResourcePermissionSeed
  parentCode?: string
}

const RESOURCES_SEEDS: ResourceSeedDto[] = [
  {
    code: 'DASHBOARD',
    alias: '대시보드',
    translations: { 'ko': '대시보드', 'en': 'Dashboard', 'ja': 'ダッシュボード', 'zh-CN': '仪表板', 'vi': 'Bảng điều khiển' },
    type: ResourceType.MENU,
    scope: ResourceScope.ORGANIZATION,
    path: '/dashboard',
    icon: 'LayoutDashboard',
    sortOrder: 1,
    permissions: {
      creatable: false,
      readable: true,
      updatable: false,
      deletable: false,
    },
  },
  {
    code: 'ORGANIZATION',
    alias: '조직 관리',
    translations: { 'ko': '조직 관리', 'en': 'Organization Management', 'ja': '組織管理', 'zh-CN': '组织管理', 'vi': 'Quản lý tổ chức' },
    type: ResourceType.MENU,
    scope: ResourceScope.ORGANIZATION,
    path: '/organizations',
    icon: 'Building2',
    sortOrder: 2,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },
  {
    code: 'MEMBER',
    alias: '멤버 관리',
    translations: { 'ko': '멤버 관리', 'en': 'Member Management', 'ja': 'メンバー管理', 'zh-CN': '成员管理', 'vi': 'Quản lý thành viên' },
    type: ResourceType.MENU,
    scope: ResourceScope.ORGANIZATION,
    path: '/members',
    icon: 'Users',
    sortOrder: 3,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },
  {
    code: 'PERMISSION',
    alias: '권한 관리',
    translations: { 'ko': '권한 관리', 'en': 'Permission Management', 'ja': '権限管理', 'zh-CN': '权限管理', 'vi': 'Quản lý quyền' },
    type: ResourceType.MENU,
    scope: ResourceScope.ORGANIZATION,
    path: '/permissions',
    icon: 'Shield',
    sortOrder: 5,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: false,
    },
  },

  {
    code: 'ANNOUNCEMENT',
    alias: '공지사항 관리',
    translations: { 'ko': '공지사항 관리', 'en': 'Announcement Management', 'ja': 'お知らせ管理', 'zh-CN': '公告管理', 'vi': 'Quản lý thông báo' },
    type: ResourceType.MENU,
    scope: ResourceScope.PLATFORM,
    path: '/announcements',
    icon: 'Megaphone',
    sortOrder: 7,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },

  {
    code: 'TERMS',
    alias: '약관 관리',
    translations: { 'ko': '약관 관리', 'en': 'Terms Management', 'ja': '利用規約管理', 'zh-CN': '条款管理', 'vi': 'Quản lý điều khoản' },
    type: ResourceType.MENU,
    scope: ResourceScope.PLATFORM,
    path: '/terms',
    icon: 'FileText',
    sortOrder: 6,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },
  {
    code: 'RESOURCE',
    alias: '리소스 관리',
    translations: { 'ko': '리소스 관리', 'en': 'Resource Management', 'ja': 'リソース管理', 'zh-CN': '资源管理', 'vi': 'Quản lý tài nguyên' },
    type: ResourceType.MENU,
    scope: ResourceScope.PLATFORM,
    path: '/resources',
    icon: 'Key',
    sortOrder: 4,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },
  {
    code: 'ROLE_RESOURCE_CREATE_BUTTON',
    alias: '메뉴 추가 버튼',
    translations: { 'ko': '메뉴 추가', 'en': 'Add Menu', 'ja': 'メニュー追加', 'zh-CN': '添加菜单', 'vi': 'Thêm Menu' },
    type: ResourceType.COMPONENT,
    scope: ResourceScope.PLATFORM,
    parentCode: 'RESOURCE',
    sortOrder: 1,
    permissions: {
      creatable: false,
      readable: true,
      updatable: false,
      deletable: false,
    },
  },
  {
    code: 'ROLE_RESOURCE_SAVE_BUTTON',
    alias: '저장 버튼',
    translations: { 'ko': '저장', 'en': 'Save', 'ja': '保存', 'zh-CN': '保存', 'vi': 'Lưu' },
    type: ResourceType.COMPONENT,
    scope: ResourceScope.PLATFORM,
    parentCode: 'RESOURCE',
    sortOrder: 2,
    permissions: {
      creatable: false,
      readable: true,
      updatable: false,
      deletable: false,
    },
  },

  {
    code: 'SUPPORT',
    alias: '고객 지원',
    translations: { 'ko': '고객 지원', 'en': 'Customer Support', 'ja': 'カスタマーサポート', 'zh-CN': '客户支持', 'vi': 'Hỗ trợ khách hàng' },
    type: ResourceType.MENU,
    scope: ResourceScope.PLATFORM,
    path: '/support',
    icon: 'LifeBuoy',
    sortOrder: 8,
    permissions: {
      creatable: true,
      readable: true,
      updatable: true,
      deletable: true,
    },
  },
  {
    code: 'AUDIT',
    alias: '감사 로그',
    translations: { 'ko': '감사 로그', 'en': 'Audit Logs', 'ja': '監査ログ', 'zh-CN': '审计日志', 'vi': 'Nhật ký kiểm toán' },
    type: ResourceType.MENU,
    scope: ResourceScope.PLATFORM,
    path: '/audit',
    icon: 'ScrollText',
    sortOrder: 9,
    permissions: {
      creatable: false,
      readable: true,
      updatable: false,
      deletable: false,
    },
  },
];

export class ResourceSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const createdResources: Record<string, Resource> = {};

    await this.seedResources(em, createdResources, RESOURCES_SEEDS.filter((seed) => !seed.parentCode));
    await em.flush();
    await this.seedResourceTranslations(em, createdResources);
    await em.flush();

    await this.seedResources(em, createdResources, RESOURCES_SEEDS.filter((seed) => seed.parentCode));
    await em.flush();
    await this.seedResourceTranslations(em, createdResources);
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
        name: seed.alias,
        type: seed.type,
        scope: seed.scope,
        ...(parent ? { parent } : {}),
        ...(seed.path === undefined ? {} : { path: seed.path }),
        ...(seed.icon === undefined ? {} : { icon: seed.icon }),
        ...(seed.sortOrder === undefined ? {} : { sortOrder: seed.sortOrder }),
        ...this.buildPermissionColumns(seed.permissions),
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
    resource.name = seed.alias;
    resource.type = seed.type;
    resource.scope = seed.scope;
    if (seed.path === undefined) {
      resource.path = null;
    }
    else {
      resource.path = seed.path;
    }

    if (seed.icon === undefined) {
      resource.icon = null;
    }
    else {
      resource.icon = seed.icon;
    }

    if (seed.sortOrder === undefined) {
      resource.sortOrder = null;
    }
    else {
      resource.sortOrder = seed.sortOrder;
    }

    Object.assign(resource, this.buildPermissionColumns(seed.permissions));

    if (parent !== undefined) {
      resource.parent = parent;
    }
    else {
      resource.parent = null;
    }
  }

  private async seedResourceTranslations(
    em: EntityManager,
    resources: Record<string, Resource>,
  ): Promise<void> {
    for (const seed of RESOURCES_SEEDS) {
      const resource = resources[seed.code];

      if (!resource) {
        continue;
      }

      const translationsToSeed = seed.translations
        ? Object.entries(seed.translations).map(([localeCode, value]) => ({ localeCode, value }))
        : [];

      for (const { localeCode, value } of translationsToSeed) {
        const translation = await em.findOne(I18nTranslation, {
          namespace: 'resource',
          key: resource.code,
          localeCode,
        });

        if (!translation) {
          em.persist(em.create(I18nTranslation, {
            namespace: 'resource',
            key: resource.code,
            localeCode,
            value,
          }));
        }
        else {
          translation.value = value;
          em.persist(translation);
        }
      }
    }
  }

  private buildPermissionColumns(permissions: ResourcePermissionSeed): ResourcePermissionSeed {
    return permissions;
  }
}
