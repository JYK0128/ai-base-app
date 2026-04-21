import { randomUUID } from 'node:crypto';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class RpcContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData<Record<string, unknown>>();

    // 게이트웨이에서 전달받은 트레이싱 정보 추출
    const traceId = (data?.['traceId'] as string) || randomUUID();
    const requestId = randomUUID(); // 마이크로서비스 내부 작업을 위한 새 요청 ID

    return this.cls.run(() => {
      // CLS 컨텍스트에 저장
      this.cls.set('traceId', traceId);
      this.cls.set('requestId', requestId);

      if (data?.['clientIp']) {
        this.cls.set('ip', data['clientIp'] as string);
      }

      return next.handle();
    });
  }
}
