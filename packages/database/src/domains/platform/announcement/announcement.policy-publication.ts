import type { FilterQuery } from '@mikro-orm/core';

import type { Announcement } from './announcement.entity';

export function isAnnouncementPublished(publishedAt?: Date | null): boolean {
  if (!publishedAt) {
    return false;
  }

  return Number.isFinite(publishedAt.getTime());
}

export function buildAnnouncementPublishedFilter(
  isPublished: boolean | undefined,
): FilterQuery<Announcement> {
  return isPublished ? { metadata: { publishedAt: { $ne: null } } } : {};
}
