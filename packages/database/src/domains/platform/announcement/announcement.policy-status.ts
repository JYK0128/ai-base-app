import { AnnouncementStatus } from './announcement.constants';
import type { AnnouncementMetadata } from './announcement.entity';

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
