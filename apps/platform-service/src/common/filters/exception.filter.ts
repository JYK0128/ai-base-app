import { ArgumentsHost, Catch, ExceptionFilter as NestExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { ApiResponse } from '@/common/types/response.type';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  constructor(
    private readonly cls: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { traceId, requestId } = this.cls.get() as { traceId: string, requestId: string };

    const ctx = host.switchToHttp();
    const originResponse = ctx.getResponse<Response>();

    const res = ApiResponse.error(exception, { traceId, requestId });
    const status = res.error?.status;
    originResponse.status(typeof status === 'number' ? status : 500).json(res);
  }
}
