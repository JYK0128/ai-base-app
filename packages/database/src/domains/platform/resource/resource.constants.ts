export const ResourceType = {
  MENU: 'MENU',
  COMPONENT: 'COMPONENT',
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export const ResourceScope = {
  PLATFORM: 'PLATFORM',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export type ResourceScope = typeof ResourceScope[keyof typeof ResourceScope];
