import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 쿠키를 가져오는 커스텀 데코레이터
 * @example @Cookies('refreshToken') refreshToken: string
 */
export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});
