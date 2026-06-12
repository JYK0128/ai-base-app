import type { I18nLocale } from '@pkg/database';

import { I18nLocaleResponseDto } from './locales/get-locales.response.dto';

export function buildI18nLocaleResponse(locale: I18nLocale): I18nLocaleResponseDto {
  return new I18nLocaleResponseDto(locale);
}
