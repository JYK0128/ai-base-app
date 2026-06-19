export const I18nLocaleDirection = {
  LTR: 'ltr',
  RTL: 'rtl',
} as const;

export type I18nLocaleDirection = typeof I18nLocaleDirection[keyof typeof I18nLocaleDirection];
