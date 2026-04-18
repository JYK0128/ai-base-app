import { randomUUID } from 'node:crypto';

import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ExtendedRequest } from '@/common/types/request.type';

@Injectable()
export class EventLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('EventLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();

    // 요청마다 고유 ID 부여 (트래킹용)
    const requestId = randomUUID();
    const traceId = (request.headers['x-trace-id'] as string) || randomUUID();

    request.requestId = requestId;
    request.traceId = traceId;

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        this.logEvent(request, data, startTime);
      }),
      catchError((error) => {
        this.logEvent(request, error, startTime, true);
        return throwError(() => error);
      }),
    );
  }

  private logEvent(
    request: ExtendedRequest,
    response: unknown,
    startTime: number,
    isError = false,
  ) {
    const { method, url, ip, requestId, traceId, body: requestBody } = request;
    const duration = Date.now() - startTime;

    let responseData = response;
    if (isError && response instanceof Error) {
      responseData = {
        message: response.message,
        status: response instanceof HttpException ? response.getStatus() : 500,
        error: response.name,
      };
    }

    const logData = {
      message: `${isError ? '[ERROR]' : '[SUCCESS]'} ${method} ${url}`,
      timestamp: new Date().toISOString(),
      requestId,
      traceId,
      method,
      url,
      ip,
      requestBody,
      response: responseData,
      duration: `${duration}ms`,
      status: isError ? 'failed' : 'success',
    };

    this.logger.log(JSON.stringify(logData));
  }
}
