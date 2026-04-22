import { randomUUID } from 'node:crypto';

import { EntityManager, RequestContext } from '@mikro-orm/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class RpcContextInterceptor implements NestInterceptor {
  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const data = context.switchToRpc().getData<Record<string, unknown>>();
    const traceId = (data?.['traceId'] as string) || randomUUID();
    const requestId = randomUUID();

    // 비동기 실행 로직을 Observable로 변환하여 반환
    return from(this.handleRequest(next, {
      traceId,
      requestId,
      clientIp: data?.['clientIp'] as string,
    }));
  }

  private async handleRequest(next: CallHandler, ctx: { traceId: string, requestId: string, clientIp?: string }) {
    return this.cls.run(async () => {
      this.cls.set('traceId', ctx.traceId);
      this.cls.set('requestId', ctx.requestId);
      if (ctx.clientIp) {
        this.cls.set('ip', ctx.clientIp);
      }

      return RequestContext.create(this.em, async () => {
        return lastValueFrom<unknown>(next.handle());
      });
    });
  }
}
