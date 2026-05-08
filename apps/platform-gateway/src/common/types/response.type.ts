import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ApiProperty } from '@nestjs/swagger';

export interface TracerInfo {
  traceId: string
  requestId: string
}

export class ErrorInfo {
  @ApiProperty({ description: '에러 코드' })
  code: string;

  @ApiProperty({
    description: '에러 메시지',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({ description: '상세 정보', required: false })
  details: unknown;

  @ApiProperty({ description: 'HTTP 상태 코드' })
  status: number;

  constructor(init: Partial<ErrorInfo>) {
    this.code = init.code || 'INTERNAL_ERROR';
    this.message = init.message || 'An unexpected error occurred';
    this.details = init.details || null;
    this.status = init.status || 500;
  }

  /**
   * 외부 에러 객체를 ErrorInfo 인스턴스로 통합 변환
   */
  static from(err: unknown): ErrorInfo {
    if (err instanceof ErrorInfo) return err;
    if (err instanceof HttpException) return this.handleHttpException(err);
    if (err instanceof RpcException) return this.handleRpcException(err);
    if (err instanceof Error) return this.handleStandardError(err);
    else return this.handleUnknownError(err);
  }

  private static handleRpcException(e: RpcException): ErrorInfo {
    const error = e.getError();
    if (typeof error === 'string') {
      return new ErrorInfo({ message: error });
    }
    return new ErrorInfo(error as Partial<ErrorInfo>);
  }

  private static handleHttpException(e: HttpException): ErrorInfo {
    const res = e.getResponse() as ErrorInfo;

    return new ErrorInfo({
      code: res.code || e.name,
      message: res.message || e.message,
      details: res.details || e,
      status: res.status || e.getStatus(),
    });
  }

  private static handleStandardError(e: Error): ErrorInfo {
    return new ErrorInfo({
      code: e.name,
      message: e.message,
      details: e,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  private static handleUnknownError(e: unknown): ErrorInfo {
    const errorInfo = new ErrorInfo({
      code: 'UNKNOWN_ERROR',
      message: typeof e === 'string' ? e : 'An unexpected error occurred',
      details: e,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    if (e && typeof e === 'object' && !Array.isArray(e)) {
      Object.assign(errorInfo, e);
    }

    return errorInfo;
  }
}

export class ApiResponse<T = null> implements TracerInfo {
  @ApiProperty({ description: '성공 여부' })
  success!: boolean;

  @ApiProperty({ description: '응답 데이터' })
  data!: T;

  @ApiProperty({ description: '에러 상세 정보', required: false })
  error?: ErrorInfo;

  @ApiProperty({ description: '응답 메시지', required: false })
  message?: string;

  @ApiProperty({ description: '추적 ID' })
  traceId!: string;

  @ApiProperty({ description: '요청 ID' })
  requestId!: string;

  constructor(params: Partial<ApiResponse<T>>) {
    Object.assign(this, params);
  }

  static success<T>(data: T, message?: string) {
    return new ApiResponse({
      success: true,
      data,
      message,
    });
  }

  static error(error: unknown) {
    const errorInfo = ErrorInfo.from(error);
    const message = Array.isArray(errorInfo.message)
      ? errorInfo.message[0]
      : errorInfo.message;

    return new ApiResponse({
      success: false,
      data: null,
      error: errorInfo,
      message,
    });
  }
}
