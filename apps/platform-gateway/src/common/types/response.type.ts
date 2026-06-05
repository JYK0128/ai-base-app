import { ApiProperty } from '@nestjs/swagger';
import { ErrorInfoMixin, ErrorInfoProps } from '@pkg/shared/server';

export interface TracerInfo {
  traceId: string
  requestId: string
}

class ErrorInfoBase implements ErrorInfoProps {
  @ApiProperty({ description: '에러 코드' })
  code!: string;

  @ApiProperty({
    description: '에러 메시지',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message!: string | string[];

  @ApiProperty({ description: '상세 정보', required: false })
  details: unknown;

  @ApiProperty({ description: 'HTTP 상태 코드' })
  status!: number;

  constructor(init: Partial<ErrorInfoProps>) {
    this.code = init.code || 'INTERNAL_ERROR';
    this.message = init.message || 'An unexpected error occurred';
    this.details = init.details || null;
    this.status = init.status || 500;
  }
}

export class ErrorInfo extends ErrorInfoMixin(ErrorInfoBase) {}

export class ApiResponse<T = null> implements TracerInfo {
  @ApiProperty({ description: '성공 여부' })
  success!: boolean;

  @ApiProperty({ description: '응답 데이터', required: false, nullable: true })
  data!: T;

  @ApiProperty({ description: '에러 상세 정보', required: false })
  error?: ErrorInfo;

  @ApiProperty({ description: '응답 메시지', required: false })
  message?: string;

  @ApiProperty({ description: '추적 ID', required: false })
  traceId!: string;

  @ApiProperty({ description: '요청 ID', required: false })
  requestId!: string;

  constructor(params: Partial<ApiResponse<T>>) {
    Object.assign(this, params);
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
      Object.assign(response, messageOrTracer);
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
      Object.assign(response, messageOrTracer);
    }

    return response;
  }
}
