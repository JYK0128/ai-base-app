import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 공지사항 수정 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  ANNOUNCEMENT_NOT_FOUND: {
    message: {
      ko: '공지사항을 찾을 수 없습니다.',
      en: 'Announcement not found.',
    },
    exception: NotFoundException,
  },
  INVALID_PERIOD: {
    message: {
      ko: '공지사항 시작일은 종료일보다 빨라야 합니다.',
      en: 'Announcement start date must be earlier than the end date.',
    },
    exception: BadRequestException,
  },
});

/**
 * 공지사항 수정 에러 단언자
 */
export const UpdateAnnouncementAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
