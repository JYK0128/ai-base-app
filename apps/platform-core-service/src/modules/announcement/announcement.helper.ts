import type { Announcement } from '@pkg/database';

import type { AnnouncementOutput } from './announcement.types';

/**
 * 공지사항을 반환 객체 타입으로 변환합니다.
 */
export const buildAnnouncementOutput = (
  announcement: Announcement,
): AnnouncementOutput => {
  const { metadata, ...rest } = announcement;
  return {
    ...rest,
    ...metadata,
    startAt: metadata.startAt.toISOString(),
    endAt: metadata.endAt.toISOString(),
    publishedAt: metadata.publishedAt.toISOString(),
  };
};
