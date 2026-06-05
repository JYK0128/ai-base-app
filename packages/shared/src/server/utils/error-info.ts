import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export interface ErrorInfoProps {
  code: string
  message: string | string[]
  details: unknown
  status: number
}

export type ErrorInfoConstructor<T = ErrorInfoProps> = new (init: Partial<ErrorInfoProps>) => T;

function handleRpcException<T extends ErrorInfoConstructor>(
  TargetClass: T,
  e: RpcException,
): InstanceType<T> {
  const error = e.getError();
  if (typeof error === 'string') {
    return new TargetClass({ message: error }) as InstanceType<T>;
  }
  return new TargetClass(error as Partial<ErrorInfoProps>) as InstanceType<T>;
}

function handleHttpException<T extends ErrorInfoConstructor>(
  TargetClass: T,
  e: HttpException,
): InstanceType<T> {
  const res = e.getResponse() as ErrorInfoProps;
  return new TargetClass({
    code: res.code || e.name,
    message: res.message || e.message,
    details: res.details || e,
    status: res.status || e.getStatus(),
  }) as InstanceType<T>;
}

function handleStandardError<T extends ErrorInfoConstructor>(
  TargetClass: T,
  e: Error,
): InstanceType<T> {
  return new TargetClass({
    code: e.name,
    message: e.message,
    details: e,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  }) as InstanceType<T>;
}

function handleUnknownError<T extends ErrorInfoConstructor>(
  TargetClass: T,
  e: unknown,
): InstanceType<T> {
  const errorInfo = new TargetClass({
    code: 'UNKNOWN_ERROR',
    message: typeof e === 'string' ? e : 'An unexpected error occurred',
    details: e,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  }) as InstanceType<T>;
  if (e && typeof e === 'object' && !Array.isArray(e)) {
    Object.assign(errorInfo, e);
  }
  return errorInfo;
}

export function ErrorInfoMixin<TBase extends ErrorInfoConstructor>(Base: TBase) {
  Object.defineProperty(Base, 'from', {
    value: function (err: unknown) {
      const TargetClass = this as TBase;
      if (err instanceof TargetClass) return err as InstanceType<TBase>;
      if (err instanceof HttpException) return handleHttpException(TargetClass, err);
      if (err instanceof RpcException) return handleRpcException(TargetClass, err);
      if (err instanceof Error) return handleStandardError(TargetClass, err);
      return handleUnknownError(TargetClass, err);
    },
    writable: true,
    configurable: true,
  });

  return Base as TBase & {
    from(err: unknown): InstanceType<TBase>
  };
}

export class ErrorInfoBase implements ErrorInfoProps {
  code: string;
  message: string | string[];
  details: unknown;
  status: number;

  constructor(init: Partial<ErrorInfoProps>) {
    this.code = init.code || 'INTERNAL_ERROR';
    this.message = init.message || 'An unexpected error occurred';
    this.details = init.details || null;
    this.status = init.status || 500;
  }
}

export class ErrorInfo extends ErrorInfoMixin(ErrorInfoBase) {}
