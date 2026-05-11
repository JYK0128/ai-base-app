import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export interface TracerInfo {
  traceId: string
  requestId: string
}

export class ErrorInfo {
  code: string;
  message: string;
  details: unknown;
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
  success!: boolean;
  data!: T;
  error?: ErrorInfo;
  traceId!: string;
  requestId!: string;

  constructor(params: Partial<ApiResponse<T>>) {
    Object.assign(this, params);
  }

  static success<T>(data: T, tracer: TracerInfo) {
    return new ApiResponse({
      success: true,
      data,
      ...tracer,
    });
  }

  static error(error: unknown, tracer: TracerInfo) {
    return new ApiResponse({
      success: false,
      data: null,
      error: ErrorInfo.from(error),
      ...tracer,
    });
  }
}
