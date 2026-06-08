import { BadRequestException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 공지사항 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  INVALID_PERIOD: {
    message: {
      ko: '공지사항 시작일은 종료일보다 빨라야 합니다.',
      en: 'Announcement start date must be earlier than the end date.',
    },
    exception: BadRequestException,
  },
});

/**
 * 공지사항 생성 에러 단언자
 */
export const CreateAnnouncementAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
