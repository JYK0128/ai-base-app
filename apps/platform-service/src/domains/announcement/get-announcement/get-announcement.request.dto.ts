import type { Announcement } from '@pkg/database';

import { IdRequestDto } from '@/common/interfaces';

export class GetAnnouncementRequestDto extends IdRequestDto<Announcement> {
}
