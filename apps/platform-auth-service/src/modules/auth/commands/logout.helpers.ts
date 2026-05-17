import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

/**
 * 로그아웃 커맨드
 */
export class LogoutCommand {
  constructor(public readonly id: string) {}
}

/**
 * 로그아웃 에러 메시지 정의 (현재는 특이사항 없음)
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 로그아웃 에러 단언자
 */
export const LogoutAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
