import type { Announcement, AnnouncementMetadata } from '@pkg/database';
import type { PickPrimitive, Plain } from '@pkg/shared';

export const ANNOUNCEMENT_SERVICE_PATTERNS = {
  ANNOUNCEMENT: {
    LIST: 'announcements.get',
    CREATE: 'announcements.create',
    UPDATE: 'announcements.update',
    DELETE: 'announcements.delete',
  },
} as const;

export type AnnouncementInput = Prettify<
  PickPrimitive<Announcement, 'title' | 'content'>
  & Partial<Plain<AnnouncementMetadata>>
>;

export type AnnouncementRecord = Prettify<
  PickPrimitive<Announcement>
  & Plain<AnnouncementMetadata>
>;

export type AnnouncementIdRecord = Prettify<
  PickPrimitive<Announcement, 'id'>
>;

export type GetAnnouncementsInput = {
  isPublishedOnly?: boolean
};

export type CreateAnnouncementInput = {
  data: AnnouncementInput
};

export type UpdateAnnouncementInput = {
  announcementId: string
  data: AnnouncementInput
};

export type DeleteAnnouncementInput = {
  announcementId: string
};
