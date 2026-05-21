import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResourceType } from '@pkg/database';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 리소스 생성 커맨드
 */
export class CreateResourceCommand {
  constructor(
    readonly code: string,
    readonly name: string,
    readonly type: ResourceType,
    readonly path?: string,
    readonly icon?: string,
    readonly parentId?: string,
    readonly sortOrder?: number,
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  ALREADY_EXISTS: {
    message: {
      ko: '이미 동일한 코드의 리소스가 존재합니다.',
      en: 'A resource with the same code already exists.',
    },
    exception: BadRequestException,
  },
  PARENT_NOT_FOUND: {
    message: {
      ko: '상위 리소스를 찾을 수 없습니다.',
      en: 'Parent resource not found.',
    },
    exception: NotFoundException,
  },
});

export const CreateResourceAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
