/**
 * 메시지 가공 유틸리티
 * 온점(.) 뒤에 공백이 있는 부분을 줄바꿈 문자(.\n)로 변환합니다.
 */
const FALLBACK_ERROR_MESSAGE = '잘못된 에러 메시지입니다.';

export function formatMessage(msg?: string) {
  if (!msg) return FALLBACK_ERROR_MESSAGE;
  return msg.replace(/\. +/g, '.\n');
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object'
  && value !== null
);

const isUnknownArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);

const firstMessage = (value: unknown): string | undefined => {
  if (isUnknownArray(value)) {
    const first = value[0];
    if (typeof first === 'string' && first.length > 0) {
      return first;
    }
    return undefined;
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return undefined;
};

const resolveNestedMessage = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;

  const message = firstMessage(value.message);
  if (message) return message;

  if (isRecord(value.error)) {
    return firstMessage(value.error.message);
  }

  return undefined;
};

const resolveApiResponseMessage = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;

  const topLevelMessage = firstMessage(value.message);
  if (topLevelMessage) return topLevelMessage;

  if (isRecord(value.error)) {
    const errorMessage = firstMessage(value.error.message);
    if (errorMessage) return errorMessage;

    if (isRecord(value.error.details)) {
      const nestedMessage = resolveNestedMessage(value.error.details.response);
      if (nestedMessage) return nestedMessage;
    }
  }

  return undefined;
};

export function resolveErrorMessage(error: unknown): string {
  if (!isRecord(error)) {
    return FALLBACK_ERROR_MESSAGE;
  }

  const responseMessage = resolveApiResponseMessage(error.response?.data);
  if (responseMessage) return responseMessage;

  const nestedResponseMessage = resolveNestedMessage(error.response);
  if (nestedResponseMessage) return nestedResponseMessage;

  const directMessage = firstMessage(error.message);
  if (directMessage) return directMessage;

  return FALLBACK_ERROR_MESSAGE;
}
