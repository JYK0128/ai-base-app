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

export const ResourceAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type ResourceAction = typeof ResourceAction[keyof typeof ResourceAction];
