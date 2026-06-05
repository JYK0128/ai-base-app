import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { TcpContext } from '@nestjs/microservices';
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
    const rpcCtx = context.switchToRpc();
    const pattern = rpcCtx.getContext<TcpContext>().getPattern();
    const data = rpcCtx.getData<Record<string, unknown>>();
    const clsStore = this.cls.get();

    return next.handle().pipe(
      // 2. 성공 로그
      tap((result) => {
        const duration = Date.now() - startTime;
        this.logger.log(`success: ${pattern} - ${duration}ms`, {
          ...clsStore,
          payload: this.sanitize(data),
          response: this.sanitize(result),
        }, 'RPC');
      }),
      // 3. 에러 로그
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(`error: ${pattern} - ${duration}ms`, {
          ...clsStore,
          payload: this.sanitize(data),
          error: this.sanitize(errorMessage),
          stack: this.sanitize(errorStack),
        }, 'RPC');
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
