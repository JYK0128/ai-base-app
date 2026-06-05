import { Catch, ExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';

import { ErrorInfo } from '../utils';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    const errorInfo = ErrorInfo.from(exception);
    return throwError(() => errorInfo);
  }
}
