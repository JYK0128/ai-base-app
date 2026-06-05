import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 공지사항 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  AUTHOR_NOT_FOUND: {
    message: {
      ko: '공지사항 작성자를 찾을 수 없습니다.',
      en: 'Announcement author not found.',
    },
    exception: NotFoundException,
  },
  TITLE_REQUIRED: {
    message: {
      ko: '공지사항 제목을 입력해주세요.',
      en: 'Announcement title is required.',
    },
    exception: BadRequestException,
  },
  CONTENT_REQUIRED: {
    message: {
      ko: '공지사항 본문을 입력해주세요.',
      en: 'Announcement content is required.',
    },
    exception: BadRequestException,
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
 * 공지사항 생성 에러 단언자
 */
export const CreateAnnouncementAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
