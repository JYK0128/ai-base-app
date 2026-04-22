import { ArgumentsHost, Catch, ExceptionFilter as NestExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import type { ApiResponse } from '../types/response.type';

/** 마이크로서비스가 사용하는 표준 규격 */
interface ErrorInfo {
  status: number
  message: string
  code: string
  details: unknown
}

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorInfo: ErrorInfo;

    if (exception instanceof HttpException) {
      errorInfo = this.handleHttpException(exception);
    }
    else if (this.isServiceError(exception)) {
      errorInfo = this.handleServiceException(exception);
    }
    else {
      errorInfo = this.handleUnknownException(exception);
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        message: errorInfo.message,
        code: errorInfo.code,
        details: errorInfo.details,
      },
      requestId: this.cls.get('requestId') || '',
      traceId: this.cls.get('traceId') || '',
    };

    response.status(errorInfo.status).json(errorResponse);
  }

  /** HTTP 예외 처리 */
  private handleHttpException(exception: HttpException): ErrorInfo {
    const status = exception.getStatus();
    const res = exception.getResponse();
    let message: string;
    let code: string = exception.constructor.name;
    let details: unknown = null;

    if (typeof res === 'string') {
      message = res;
    }
    else {
      const resObj = res as Record<string, unknown>;
      const resMessage = resObj['message'];

      message = Array.isArray(resMessage)
        ? resMessage.join(', ')
        : (resMessage as string) || JSON.stringify(resObj);

      const resError = resObj['error'] || resObj['code'];
      if (typeof resError === 'string') {
        code = resError;
      }

      if (Array.isArray(resMessage)) {
        details = resMessage;
      }
    }

    return { status, message, code, details };
  }

  /** 마이크로서비스 에러(RPC) 처리 */
  private handleServiceException(exception: Partial<ErrorInfo>): ErrorInfo {
    const status = typeof exception.status === 'number'
      ? exception.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = typeof exception.message === 'string'
      ? exception.message
      : 'Internal service error';
    const code = typeof exception.code === 'string'
      ? exception.code
      : 'ServiceError';

    return {
      status,
      message,
      code,
      details: exception.details ?? null,
    };
  }

  /** 알 수 없는 에러 처리 (Fallback) */
  private handleUnknownException(exception: unknown): ErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception instanceof Error ? exception.message : 'An unexpected error occurred',
      code: exception instanceof Error ? exception.name : 'InternalServerError',
      details: null,
    };
  }

  /** 마이크로서비스 에러 판별 가드 */
  private isServiceError(exception: unknown): exception is Partial<ErrorInfo> {
    return !!(
      exception
      && typeof exception === 'object'
      && ('status' in exception || 'code' in exception || 'message' in exception)
    );
  }
}
