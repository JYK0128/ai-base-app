import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { throwError } from 'rxjs';

interface ErrorInfo {
  status: number
  message: string
  code: string
  details: unknown
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown) {
    const traceId = this.cls.get('traceId') || 'internal';
    const requestId = this.cls.get('requestId') || 'internal';

    let errorInfo: ErrorInfo;

    if (exception instanceof HttpException) {
      errorInfo = this.handleHttpException(exception);
    }
    else if (exception instanceof RpcException) {
      errorInfo = this.handleRpcException(exception);
    }
    else {
      errorInfo = this.handleUnknownException(exception);
    }

    return throwError(() => ({
      status: errorInfo.status,
      message: errorInfo.message,
      code: errorInfo.code,
      details: errorInfo.details,
      traceId,
      requestId,
    }));
  }

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

  private handleRpcException(exception: RpcException): ErrorInfo {
    const error = exception.getError();

    // 기본값 (fallback)
    const defaultError: ErrorInfo = {
      status: 500,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: null,
    };

    // 1. string 형태 (ex: "something went wrong")
    if (typeof error === 'string') {
      return {
        ...defaultError,
        message: error,
      };
    }

    // 2. object 형태
    if (error && typeof error === 'object') {
      const err = error as Partial<ErrorInfo>;

      return {
        status: err.status ?? defaultError.status,
        message: err.message ?? defaultError.message,
        code: err.code ?? defaultError.code,
        details: err.details ?? err,
      };
    }

    // 3. 예상 못한 타입
    return defaultError;
  }

  private handleUnknownException(exception: unknown): ErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception instanceof Error ? exception.message : 'An unexpected error occurred',
      code: exception instanceof Error ? exception.name : 'InternalServerError',
      details: null,
    };
  }
}
