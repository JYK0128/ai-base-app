import type { AnnouncementInput } from '../announcement.types';

/**
 * 공지사항 생성/수정 커맨드
 */
export class CreateAnnouncementCommand {
  constructor(
    public readonly memberId: string,
    public readonly data: AnnouncementInput,
  ) {}
}
