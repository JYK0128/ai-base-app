import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { JWTPayload } from 'jose';

/**
 * 전역 AuthGuard에 의해 request['user']에 담긴 페이로드 정보를 가져옵니다.
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JWTPayload | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JWTPayload }>();
    return req.user;
  },
);
