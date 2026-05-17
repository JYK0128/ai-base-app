import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand {
  constructor(
    public readonly authorId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly isPublished?: boolean,
  ) {}
}

/**
 * 공지사항 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 공지사항 생성 에러 단언자
 */
export const CreateAnnouncementAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
