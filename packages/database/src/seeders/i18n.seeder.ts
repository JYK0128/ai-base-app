import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { I18nLocale, I18nLocaleDirection } from '@/domains/platform/i18n/i18n.locale.entity';

const LOCALES = [
  {
    code: 'ko',
    name: '한국어',
    regionCode: 'KR',
    direction: I18nLocaleDirection.LTR,
    isActive: true,
    isDefault: true,
    sortOrder: 1,
  },
  {
    code: 'en',
    name: 'English',
    regionCode: 'US',
    direction: I18nLocaleDirection.LTR,
    isActive: true,
    isDefault: false,
    sortOrder: 2,
  },
  {
    code: 'ja',
    name: '日本語',
    regionCode: 'JP',
    direction: I18nLocaleDirection.LTR,
    isActive: true,
    isDefault: false,
    sortOrder: 3,
  },
  {
    code: 'zh-CN',
    name: '中文 (简体)',
    regionCode: 'CN',
    direction: I18nLocaleDirection.LTR,
    isActive: true,
    isDefault: false,
    sortOrder: 4,
  },
];

export class I18nSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const desiredCodes = LOCALES.map((locale) => locale.code);

    for (const localeData of LOCALES) {
      const exists = await em.findOne(I18nLocale, { code: localeData.code });
      if (exists) {
        em.assign(exists, localeData);
        em.persist(exists);
      }
      else {
        const locale = em.create(I18nLocale, localeData);
        em.persist(locale);
      }
    }

    const inactiveLocales = await em.find(I18nLocale, {
      code: { $nin: desiredCodes },
      isActive: true,
    });

    for (const locale of inactiveLocales) {
      locale.isActive = false;
      em.persist(locale);
    }

    await em.flush();
  }
}
