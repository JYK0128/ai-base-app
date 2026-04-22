import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * 쿠키를 가져오는 커스텀 데코레이터
 * @example @Cookies('refreshToken') refreshToken: string
 */
export const Cookies = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return data ? request.cookies?.[data] : request.cookies;
});
