import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { throwError } from 'rxjs';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown) {
    const traceId = this.cls.get('traceId') || 'internal';
    const requestId = this.cls.get('requestId') || 'internal';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'InternalServerError';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      }
      else {
        const resObj = response as Record<string, unknown>;
        message = (resObj['message'] as string) || message;
        code = (resObj['error'] as string) || exception.constructor.name;
        details = resObj['message'] || null;
      }
    }
    else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }
    else {
      message = String(exception);
    }

    // 게이트웨이가 기대하는 인터페이스 형태로 반환
    return throwError(() => ({
      status,
      message,
      name: code,
      details,
      traceId,
      requestId,
    }));
  }
}
