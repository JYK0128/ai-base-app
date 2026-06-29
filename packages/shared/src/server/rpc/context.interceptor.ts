import { EntityManager, RequestContext } from '@mikro-orm/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import pick from 'lodash/pick';
import { ClsService } from 'nestjs-cls';
import { firstValueFrom, from, Observable } from 'rxjs';

import { type AuthContext, CONTEXT_KEYS } from '../utils/context';

@Injectable()
export class RpcContextInterceptor implements NestInterceptor {
  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const data = context.switchToRpc().getData<Record<string, unknown>>();
    const contextData = pick(data, CONTEXT_KEYS) as AuthContext;

    return from(
      this.cls.runWith({ ...contextData }, () =>
        RequestContext.create(this.em, async () => {
          const requestEm = RequestContext.getEntityManager();
          requestEm?.setLoggerContext(this.cls.get());

          return firstValueFrom(next.handle());
        }),
      ),
    );
  }
}
