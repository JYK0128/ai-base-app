import { ArgumentsHost, Catch, ExceptionFilter as NestExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

import { ApiResponse, ErrorInfo } from '@/common/types/response.type';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly cls: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error({ exception }, 'Exception caught in filter');
    this.logger.error({
      exception,
      isErrorInfo: exception instanceof ErrorInfo,
      isHttpException: exception instanceof HttpException,
      isError: exception instanceof Error,
    });
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = ApiResponse.error(exception, {
      requestId: this.cls.get('requestId'),
      traceId: this.cls.get('traceId'),
    });

    response.status(errorResponse.error?.status || 500).json(errorResponse);
  }
}
