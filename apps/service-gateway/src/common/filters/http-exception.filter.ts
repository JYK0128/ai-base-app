import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { ExtendedRequest } from '@/common/types/request.type';

import type { ApiResponse } from '../types/response.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<ExtendedRequest>();

    const status
      = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, code, details } = this.extractErrorInfo(exception);

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      traceId: request.traceId,
    };

    response.status(status).json(errorResponse);
  }

  private extractErrorInfo(exception: unknown) {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof Error) {
      return {
        message: exception.message,
        code: exception.name,
        details: null,
      };
    }

    return {
      message: 'Internal server error',
      code: 'InternalServerError',
      details: null,
    };
  }

  private handleHttpException(exception: HttpException) {
    const res = exception.getResponse();
    let message: string;
    let code: string = exception.constructor.name;
    let details: unknown = null;

    if (typeof res === 'string') {
      message = res;
    }
    else if (typeof res === 'object') {
      const resObj = res as Record<string, unknown>;
      const resMessage = resObj.message;

      message = Array.isArray(resMessage)
        ? resMessage.join(', ')
        : (resMessage as string) || JSON.stringify(resObj);

      const extractedCode = resObj.code || resObj.error;
      if (typeof extractedCode === 'string') {
        code = extractedCode.replace(/\s+/g, '');
      }

      if (Array.isArray(resMessage)) {
        details = resMessage;
      }
    }
    else {
      message = JSON.stringify(res);
    }

    return { message, code, details };
  }
}
