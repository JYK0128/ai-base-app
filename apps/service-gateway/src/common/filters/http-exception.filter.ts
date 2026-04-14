import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { ExtendedRequest } from '../types/request.type';

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

    const message
      = exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      success: false,
      error: {
        message: typeof message === 'string'
          ? message
          : (message as Record<string, unknown>).message
            || JSON.stringify(message),
        code: exception instanceof HttpException ? exception.constructor.name : 'InternalServerError',
      },
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      traceId: request.traceId,
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
