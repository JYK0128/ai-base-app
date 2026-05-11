import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RPC');

  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const startTime = Date.now();
    const rpcContext = context.switchToRpc();
    const rpcCtx = rpcContext.getContext<{ getPattern?: () => string }>();
    const pattern = rpcCtx?.getPattern?.() || 'unknown';
    const data = rpcContext.getData<Record<string, unknown>>();

    const traceId = this.cls.get('traceId') || 'internal';
    const requestId = this.cls.get('requestId') || 'internal';
    const sid = this.cls.get('sid');
    const id = this.cls.get('id');
    const organizationId = this.cls.get('organizationId');

    // 1. 요청 시작 로그
    this.logger.log({
      msg: `[RPC Request] ${pattern}`,
      pattern,
      traceId,
      requestId,
      sid,
      id,
      organizationId,
      payload: this.sanitize(data),
    });

    return next.handle().pipe(
      // 2. 성공 로그
      tap((result) => {
        const duration = Date.now() - startTime;
        this.logger.log({
          msg: `[RPC Success] ${pattern}`,
          pattern,
          traceId,
          requestId,
          sid,
          id,
          organizationId,
          duration: `${duration}ms`,
          response: this.sanitize(result),
        });
      }),
      // 3. 에러 로그
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error({
          msg: `[RPC Error] ${pattern}`,
          pattern,
          traceId,
          requestId,
          sid,
          id,
          organizationId,
          duration: `${duration}ms`,
          error: errorMessage,
          stack: errorStack,
        });
        return throwError(() => error);
      }),
    );
  }

  /** 민감 정보를 필터링하거나 데이터를 정리하는 헬퍼 */
  private sanitize(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    // 비밀번호 등 민감 필드 마스킹
    const sanitized = { ...data as Record<string, unknown> };
    const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken'];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '********';
      }
    }

    return sanitized;
  }
}
