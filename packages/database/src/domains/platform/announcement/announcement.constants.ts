export const AnnouncementCategory = {
  NOTICE: 'NOTICE',
  MAINTENANCE: 'MAINTENANCE',
  SECURITY: 'SECURITY',
  EVENT: 'EVENT',
} as const;

export type AnnouncementCategory = typeof AnnouncementCategory[keyof typeof AnnouncementCategory];

export const AnnouncementAudience = {
  ALL: 'ALL',
  PLATFORM: 'PLATFORM',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export type AnnouncementAudience = typeof AnnouncementAudience[keyof typeof AnnouncementAudience];

export const AnnouncementChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
} as const;

export type AnnouncementChannel = typeof AnnouncementChannel[keyof typeof AnnouncementChannel];

export const AnnouncementPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
} as const;

export type AnnouncementPriority = typeof AnnouncementPriority[keyof typeof AnnouncementPriority];

export const AnnouncementStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type AnnouncementStatus = typeof AnnouncementStatus[keyof typeof AnnouncementStatus];
