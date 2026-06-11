import type { Announcement } from '@pkg/database';

import type { AnnouncementRecord } from './announcement.contract';

/**
 * 공지사항을 반환 객체 타입으로 변환합니다.
 */
export const buildAnnouncementOutput = (
  announcement: Announcement,
): AnnouncementRecord => {
  const { metadata, ...rest } = announcement;

  return {
    ...rest,
    ...metadata,
    isDeleted: announcement.isDeleted,
    isPublished: announcement.isPublished,
    startAt: metadata.startAt.toISOString(),
    endAt: metadata.endAt.toISOString(),
    publishedAt: metadata.publishedAt.toISOString(),
  };
};
