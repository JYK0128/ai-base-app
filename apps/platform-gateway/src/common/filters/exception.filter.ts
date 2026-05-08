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
    const originResponse = ctx.getResponse<Response>();

    const res = ApiResponse.error(exception);
    res.traceId = this.cls.get('traceId');
    res.requestId = this.cls.get('requestId');

    originResponse.status(res.error?.status || 500).json(res);
  }
}
