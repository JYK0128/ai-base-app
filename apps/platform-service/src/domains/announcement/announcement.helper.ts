import type { Announcement } from '@pkg/database';

import { AnnouncementResponseDto } from './get-announcements/get-announcements.response.dto';

export function buildAnnouncementResponse(announcement: Announcement): AnnouncementResponseDto {
  return new AnnouncementResponseDto(announcement);
}
