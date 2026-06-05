import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '@/common/types/response.type';

@Injectable()
export class TraceInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        const { traceId, requestId } = this.cls.get() as { traceId: string, requestId: string };
        const res = data instanceof ApiResponse
          ? data
          : ApiResponse.success(data, { traceId, requestId });

        return res;
      }),
    );
  }
}
