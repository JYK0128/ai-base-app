import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { I18nTranslation } from '@/domains/platform/i18n/i18n.translation.entity';
import { Resource, ResourceType } from '@/domains/platform/resource/resource.entity';

interface ResourceSeedDto {
  code: string
  alias: string
  translations?: Record<string, string>
  type: ResourceType
  path?: string
  icon?: string
  sortOrder?: number
  parentCode?: string
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[]
}

const RESOURCES_SEEDS: ResourceSeedDto[] = [
  // 1. 대시보드
  {
    code: 'DASHBOARD',
    alias: '대시보드',
    translations: { 'ko': '대시보드', 'en': 'Dashboard', 'ja': 'ダッシュボード', 'zh-CN': '仪表板', 'vi': 'Bảng điều khiển' },
    type: ResourceType.MENU,
    path: '/dashboard',
    icon: 'LayoutDashboard',
    sortOrder: 1,
    actions: ['READ'],
  },
  // 2. 조직 관리
  {
    code: 'ORGANIZATION',
    alias: '조직 관리',
    translations: { 'ko': '조직 관리', 'en': 'Organization Management', 'ja': '組織管理', 'zh-CN': '组织管理', 'vi': 'Quản lý tổ chức' },
    type: ResourceType.MENU,
    path: '/organizations',
    icon: 'Building2',
    sortOrder: 2,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 3. 공지사항 관리
  {
    code: 'ANNOUNCEMENT',
    alias: '공지사항 관리',
    translations: { 'ko': '공지사항 관리', 'en': 'Announcement Management', 'ja': 'お知らせ管理', 'zh-CN': '公告管理', 'vi': 'Quản lý thông báo' },
    type: ResourceType.MENU,
    path: '/announcements',
    icon: 'Megaphone',
    sortOrder: 3,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 4. 고객 지원
  {
    code: 'SUPPORT',
    alias: '고객 지원',
    translations: { 'ko': '고객 지원', 'en': 'Customer Support', 'ja': 'カスタマーサポート', 'zh-CN': '客户支持', 'vi': 'Hỗ trợ khách hàng' },
    type: ResourceType.MENU,
    path: '/support',
    icon: 'LifeBuoy',
    sortOrder: 4,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 5. 감사 로그
  {
    code: 'AUDIT',
    alias: '감사 로그',
    translations: { 'ko': '감사 로그', 'en': 'Audit Logs', 'ja': '監査ログ', 'zh-CN': '审计日志', 'vi': 'Nhật ký kiểm toán' },
    type: ResourceType.MENU,
    path: '/audit',
    icon: 'ScrollText',
    sortOrder: 5,
    actions: ['READ'],
  },
  // 6. 조직 멤버 관리
  {
    code: 'MEMBER',
    alias: '조직 멤버 관리',
    translations: { 'ko': '조직 멤버 관리', 'en': 'Member Management', 'ja': 'メンバー管理', 'zh-CN': '成员管理', 'vi': 'Quản lý thành viên' },
    type: ResourceType.MENU,
    path: '/members',
    icon: 'Users',
    sortOrder: 6,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 7. 리소스 관리
  {
    code: 'RESOURCE',
    alias: '리소스 관리',
    translations: { 'ko': '리소스 관리', 'en': 'Resource Management', 'ja': 'リソース管理', 'zh-CN': '资源管理', 'vi': 'Quản lý tài nguyên' },
    type: ResourceType.MENU,
    path: '/resources',
    icon: 'Key',
    sortOrder: 7,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  {
    code: 'ROLE_RESOURCE_CREATE_BUTTON',
    alias: '메뉴 추가 버튼',
    translations: { 'ko': '메뉴 추가', 'en': 'Add Menu', 'ja': 'メニュー追加', 'zh-CN': '添加菜单', 'vi': 'Thêm Menu' },
    type: ResourceType.COMPONENT,
    parentCode: 'RESOURCE',
    sortOrder: 1,
    actions: ['READ'],
  },
  {
    code: 'ROLE_RESOURCE_SAVE_BUTTON',
    alias: '저장 버튼',
    translations: { 'ko': '저장', 'en': 'Save', 'ja': '保存', 'zh-CN': '保存', 'vi': 'Lưu' },
    type: ResourceType.COMPONENT,
    parentCode: 'RESOURCE',
    sortOrder: 2,
    actions: ['READ'],
  },
  // 8. 조직 기본 정보
  {
    code: 'ORG_INFO',
    alias: '조직 기본 정보',
    translations: { 'ko': '조직 기본 정보', 'en': 'Organization Info', 'ja': '組織基本情報', 'zh-CN': '组织基本信息', 'vi': 'Thông tin tổ chức' },
    type: ResourceType.MENU,
    path: '/info',
    icon: 'Info',
    sortOrder: 8,
    actions: ['READ', 'UPDATE'],
  },
  // 9. 조직 서비스 데이터
  {
    code: 'SERVICE',
    alias: '조직 서비스 데이터',
    translations: { 'ko': '조직 서비스 데이터', 'en': 'Service Data', 'ja': 'サービスデータ', 'zh-CN': '服务数据', 'vi': 'Dữ liệu dịch vụ' },
    type: ResourceType.MENU,
    path: '/service',
    icon: 'Settings',
    sortOrder: 9,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  // 10. 약관 관리
  {
    code: 'TERMS',
    alias: '약관 관리',
    translations: { 'ko': '약관 관리', 'en': 'Terms Management', 'ja': '利用規約管理', 'zh-CN': '条款管理', 'vi': 'Quản lý điều khoản' },
    type: ResourceType.MENU,
    path: '/terms',
    icon: 'FileText',
    sortOrder: 10,
    actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
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
        parent,
        path: seed.path,
        icon: seed.icon,
        sortOrder: seed.sortOrder,
        actions: seed.actions,
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
}
