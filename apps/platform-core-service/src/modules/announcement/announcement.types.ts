import type { Announcement, AnnouncementMetadata } from '@pkg/database';
import type { PickPrimitive, Plain } from '@pkg/shared';

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
