import { randomUUID } from 'node:crypto';

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { ExtendedRequest } from '@/common/types/request.type';

@Injectable()
export class EventLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuthService-Log');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const requestId = randomUUID();
    let traceId = '';

    if (context.getType() === 'http') {
      // HTTP 요청 처리 (Health Check 등)
      const request = context.switchToHttp().getRequest<ExtendedRequest>();
      traceId = request.headers['x-trace-id'] || randomUUID();

      request.requestId = requestId;
      request.traceId = traceId;
    }
    else if (context.getType() === 'rpc') {
      // RPC(RabbitMQ) 요청 처리
      const data = context.switchToRpc().getData<unknown>();

      // any를 제거하고 unknown과 타입 체크를 사용
      traceId = data?.['traceId'] || randomUUID();

      // 핸들러에서 사용할 수 있도록 requestId 주입
      if (data && typeof data === 'object') {
        (data as Record<string, unknown>)['requestId'] = requestId;
      }
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const logData = {
          message: `[RPC/HTTP] ${context.getType()} Request Processed`,
          timestamp: new Date().toISOString(),
          requestId,
          traceId,
          duration: `${duration}ms`,
          type: context.getType(),
          response: data,
        };

        // 구조화된 로깅 (stdout)
        this.logger.log(JSON.stringify(logData));
      }),
    );
  }
}
