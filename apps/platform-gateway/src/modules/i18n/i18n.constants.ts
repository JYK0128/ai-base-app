/**
 * i18n 마이크로서비스 인젝션 토큰
 */
export const I18N_SERVICE = 'I18N_SERVICE';

/**
 * i18n 마이크로서비스와의 통신을 위한 메시지 패턴 상수 정의
 */
export const I18N_SERVICE_PATTERNS = {
  LOCALES: {
    GET: 'i18n.locales.get',
  },
  TRANSLATIONS: {
    GET_ONE: 'i18n.translations.get.one',
    GET_MANY: 'i18n.translations.get.many',
    BULK: 'i18n.translations.bulk',
    CREATE: 'i18n.translations.create',
    UPDATE: 'i18n.translations.update',
    DELETE: 'i18n.translations.delete',
  },
} as const;
