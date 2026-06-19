import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ANNOUNCEMENT_NOT_FOUND: {
    message: {
      ko: '공지사항을 찾을 수 없습니다.',
      en: 'Announcement not found.',
    },
    exception: NotFoundException,
  },
});

export const GetAnnouncementAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
