import { ApiProperty } from '@nestjs/swagger';
import { ErrorInfoMixin, ErrorInfoProps } from '@pkg/shared/server';

import { ErrorCode } from './error-code';

export interface TracerInfo {
  traceId: string | null
  requestId: string | null
}

class ErrorInfoBase implements ErrorInfoProps {
  @ApiProperty({ type: String, description: '에러 코드', enum: ErrorCode })
  code!: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }], description: '에러 메시지' })
  message!: string | string[];

  @ApiProperty({ type: Object, nullable: true, description: '상세 정보' })
  details!: unknown;

  @ApiProperty({ type: Number, description: 'HTTP 상태 코드' })
  status!: number;

  constructor(init: Partial<ErrorInfoProps>) {
    this.code = typeof init.code === 'string' && init.code.length > 0
      ? init.code
      : 'INTERNAL_ERROR';
    if (typeof init.message === 'string' && init.message.length > 0) {
      this.message = init.message;
    }
    else if (Array.isArray(init.message) && init.message.length > 0) {
      this.message = init.message[0];
    }
    else {
      this.message = 'An unexpected error occurred';
    }
    this.details = init.details === null || init.details === undefined
      ? null
      : init.details;
    this.status = typeof init.status === 'number' && Number.isFinite(init.status)
      ? init.status
      : 500;
  }
}

export class ErrorInfo extends ErrorInfoMixin(ErrorInfoBase) {}

export class ApiResponse<T = null> implements TracerInfo {
  @ApiProperty({ type: Boolean, description: '성공 여부' })
  success!: boolean;

  @ApiProperty({ type: Object, nullable: true, description: '응답 데이터' })
  data!: T | null;

  @ApiProperty({ type: () => ErrorInfo, nullable: true, description: '에러 상세 정보' })
  error!: ErrorInfo | null;

  @ApiProperty({ type: String, nullable: true, description: '응답 메시지' })
  message!: string | null;

  @ApiProperty({ type: String, nullable: true, description: '추적 ID' })
  traceId!: string | null;

  @ApiProperty({ type: String, nullable: true, description: '요청 ID' })
  requestId!: string | null;

  constructor(params: Partial<ApiResponse<T>>) {
    this.success = params.success ?? false;
    this.data = params.data ?? null;
    this.error = params.error ?? null;
    this.message = params.message ?? null;
    this.traceId = params.traceId ?? null;
    this.requestId = params.requestId ?? null;
  }

  static success<T>(data: T): ApiResponse<T>;
  static success<T>(data: T, message: string): ApiResponse<T>;
  static success<T>(data: T, tracer: Partial<TracerInfo>): ApiResponse<T>;
  static success<T>(data: T, messageOrTracer?: string | Partial<TracerInfo>) {
    const response = new ApiResponse({
      success: true,
      data,
    });

    if (typeof messageOrTracer === 'string') {
      response.message = messageOrTracer;
    }
    else if (messageOrTracer) {
      response.traceId = messageOrTracer.traceId ?? null;
      response.requestId = messageOrTracer.requestId ?? null;
    }

    return response;
  }

  static error(error: unknown): ApiResponse<null>;
  static error(error: unknown, tracer: Partial<TracerInfo>): ApiResponse<null>;
  static error(error: unknown, message: string): ApiResponse<null>;
  static error(error: unknown, messageOrTracer?: string | Partial<TracerInfo>) {
    const errorInfo = ErrorInfo.from(error);
    const message = Array.isArray(errorInfo.message)
      ? errorInfo.message[0]
      : errorInfo.message;

    const response = new ApiResponse({
      success: false,
      data: null,
      error: errorInfo,
      message,
    });

    if (typeof messageOrTracer === 'string') {
      response.message = messageOrTracer;
    }
    else if (messageOrTracer) {
      response.traceId = messageOrTracer.traceId ?? null;
      response.requestId = messageOrTracer.requestId ?? null;
    }

    return response;
  }
}
