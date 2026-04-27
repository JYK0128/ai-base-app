import { Catch, ExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';

import { ErrorInfo } from '../types/response.type';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    const errorInfo = ErrorInfo.from(exception);
    return throwError(() => errorInfo);
  }
}
