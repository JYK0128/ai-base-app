import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResourceType } from '@pkg/database';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

export type ResourceBatchOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface CreateResourceBatchItem {
  readonly operation: ResourceBatchOperation
  readonly tempId?: string
  readonly id?: string
  readonly code?: string
  readonly name?: string
  readonly type?: ResourceType
  readonly path?: string
  readonly icon?: string
  readonly parentId?: string
  readonly parentTempId?: string
  readonly sortOrder?: number
  readonly translations?: Record<string, string>
  readonly actions?: string[]
}

/**
 * 리소스 일괄 생성 커맨드
 */
export class CreateResourcesCommand {
  constructor(
    readonly items: CreateResourceBatchItem[],
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  DUPLICATE_TEMP_ID: {
    message: {
      ko: '중복된 임시 ID가 있습니다.',
      en: 'Duplicate temporary resource ID exists.',
    },
    exception: BadRequestException,
  },
  DUPLICATE_CODE: {
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
  INVALID_PARENT_REFERENCE: {
    message: {
      ko: '상위 리소스 참조가 올바르지 않습니다.',
      en: 'Invalid parent resource reference.',
    },
    exception: BadRequestException,
  },
  CYCLIC_DEPENDENCY: {
    message: {
      ko: '리소스 배치 생성 중 순환 참조가 감지되었습니다.',
      en: 'Cyclic dependency detected while creating resources in batch.',
    },
    exception: BadRequestException,
  },
  DUPLICATE_RESOURCE_ID: {
    message: {
      ko: '중복된 리소스 ID가 있습니다.',
      en: 'Duplicate resource ID exists.',
    },
    exception: BadRequestException,
  },
  MISSING_CREATE_FIELDS: {
    message: {
      ko: '생성에 필요한 필드가 누락되었습니다.',
      en: 'Required fields for creation are missing.',
    },
    exception: BadRequestException,
  },
  MISSING_UPDATE_ID: {
    message: {
      ko: '수정할 리소스 ID가 필요합니다.',
      en: 'Resource ID is required for update.',
    },
    exception: BadRequestException,
  },
  MISSING_DELETE_ID: {
    message: {
      ko: '삭제할 리소스 ID가 필요합니다.',
      en: 'Resource ID is required for delete.',
    },
    exception: BadRequestException,
  },
  RESOURCE_NOT_FOUND: {
    message: {
      ko: '리소스를 찾을 수 없습니다.',
      en: 'Resource not found.',
    },
    exception: NotFoundException,
  },
});

export const CreateResourcesAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
