import type { FilterQuery } from '@mikro-orm/core';

import { AnnouncementStatus } from './announcement.constants';
import type { AnnouncementMetadata } from './announcement.entity';
import type { Announcement } from './announcement.entity';

export function getAnnouncementStatus(
  metadata: Pick<AnnouncementMetadata, 'publishedAt' | 'startAt' | 'endAt'>,
  now: number = Date.now(),
): AnnouncementStatus {
  if (!metadata.publishedAt) {
    return AnnouncementStatus.DRAFT;
  }

  const startAt = metadata.startAt?.getTime();
  const endAt = metadata.endAt?.getTime();

  if (typeof startAt === 'number' && startAt > now) {
    return AnnouncementStatus.SCHEDULED;
  }

  if (typeof endAt === 'number' && endAt < now) {
    return AnnouncementStatus.EXPIRED;
  }

  return AnnouncementStatus.ACTIVE;
}

export function buildAnnouncementStatusFilter(
  status: AnnouncementStatus | undefined,
  now: number = Date.now(),
): FilterQuery<Announcement> {
  switch (status) {
    case AnnouncementStatus.DRAFT:
      return { metadata: { publishedAt: null } };

    case AnnouncementStatus.SCHEDULED:
      return { metadata: { publishedAt: { $ne: null }, startAt: { $gt: new Date(now) } } };

    case AnnouncementStatus.ACTIVE:
      return {
        metadata: {
          publishedAt: { $ne: null },
          startAt: { $lte: new Date(now) },
          endAt: { $gte: new Date(now) },
        },
      };

    case AnnouncementStatus.EXPIRED:
      return { metadata: { publishedAt: { $ne: null }, endAt: { $lt: new Date(now) } } };

    default:
      return {};
  }
}
