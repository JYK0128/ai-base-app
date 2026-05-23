const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'vi', 'es', 'fr', 'de'];

export function normalizeAdminLocale(locale?: string | null): string {
  const lang = locale?.split('-')[0].toLowerCase() || '';
  if (lang === 'zh') return 'zh-CN';
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : 'ko';
}

export function getStoredAdminLocale(): string {
  const raw = typeof window !== 'undefined'
    ? (localStorage.getItem('admin_lang') ?? navigator.language)
    : 'ko';
  return normalizeAdminLocale(raw);
}
