import { randomUUID } from 'node:crypto';

import { EntityManager, RequestContext } from '@mikro-orm/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService, type ClsStore } from 'nestjs-cls';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class RpcContextInterceptor implements NestInterceptor {
  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const data = context.switchToRpc().getData<ClsStore>();

    return from(
      this.cls.run(() => {
        this.cls.set('traceId', data.traceId);
        this.cls.set('sid', data.sid);
        this.cls.set('requestId', randomUUID());
        this.cls.set('clientIp', data.clientIp);
        this.cls.set('id', data.id);
        this.cls.set('organizationId', data.organizationId);

        return RequestContext.create(this.em, () => lastValueFrom(next.handle()));
      }),
    );
  }
}
