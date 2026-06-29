import { Announcement } from '@pkg/database';

import { IdRequestDto } from '@/common/interfaces';

export class DeleteAnnouncementRequestDto extends IdRequestDto<Announcement> {
}
