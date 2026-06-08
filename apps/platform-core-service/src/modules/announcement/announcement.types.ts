import type { Announcement, AnnouncementMetadata } from '@pkg/database';
import type { Plain } from '@pkg/shared';

export type AnnouncementInput = Prettify<
  Pick<Announcement, 'title' | 'content'>
  & Partial<Plain<AnnouncementMetadata>>
>;

export type AnnouncementOutput = Prettify<
  Pick<Announcement, 'title' | 'content'>
  & Plain<AnnouncementMetadata>
>;

export type AnnouncementOutputId = Prettify<
  Pick<Announcement, 'id'>
>;
