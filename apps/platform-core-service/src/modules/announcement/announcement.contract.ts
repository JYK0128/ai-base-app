import type { AnnouncementInput } from './announcement.types';

export const ANNOUNCEMENT_SERVICE_PATTERNS = {
  ANNOUNCEMENT: {
    LIST: 'announcements.get',
    CREATE: 'announcements.create',
    UPDATE: 'announcements.update',
    DELETE: 'announcements.delete',
  },
} as const;

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
