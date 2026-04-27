import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import type { JWTPayload } from '../types/request.type';

/**
 * 전역 AuthGuard에 의해 request['user']에 담긴 페이로드 정보를 가져옵니다.
 */
export const CurrentUser = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const app = ctx.switchToHttp().getNext<NestApplication>();

    const [scheme, token] = req.headers['authorization']?.split(' ') || [];
    const jwt = app.get(JwtService);

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }
    return jwt.verifyAsync<JWTPayload>(token);
  },
);
