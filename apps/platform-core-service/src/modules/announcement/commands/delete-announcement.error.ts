import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 공지사항 삭제 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 공지사항 삭제 에러 단언자
 */
export const DeleteAnnouncementAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
