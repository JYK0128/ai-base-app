import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import type { ApiResponse } from '../types/response.type';

/** 마이크로서비스로부터 전달받은 에러 객체 인터페이스 */
interface MicroserviceError {
  status?: number
  statusCode?: number
  message?: string
  name?: string
  details?: unknown
}

interface ErrorInfo {
  status: number
  message: string
  code: string
  details: unknown
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. 에러 유형 판별 및 정보 추출
    let errorInfo: ErrorInfo;

    if (exception instanceof HttpException) {
      errorInfo = this.handleHttpException(exception);
    }
    else if (this.isMicroserviceError(exception)) {
      errorInfo = this.handleRpcException(exception);
    }
    else {
      errorInfo = this.handleUnknownException(exception);
    }

    // 2. 표준 응답 객체 생성
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

    // 3. 응답 전송
    response.status(errorInfo.status).json(errorResponse);
  }

  /** NestJS 표준 예외 처리 */
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
  private handleRpcException(error: MicroserviceError): ErrorInfo {
    return {
      status: error.status || error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Internal server error',
      code: error.name || 'RpcError',
      details: error.details || null,
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
  private isMicroserviceError(exception: unknown): exception is MicroserviceError {
    return !!(
      exception
      && typeof exception === 'object'
      && ('status' in exception || 'statusCode' in exception || 'message' in exception)
    );
  }
}
