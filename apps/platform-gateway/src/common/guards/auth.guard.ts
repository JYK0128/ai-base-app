import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { ALLOW_EXPIRED_PASSWORD_KEY } from '@/common/decorators/allow-expired-password.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { AuthClient } from '@/modules/auth/auth.client';

import type { JWTPayload } from '../types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly authClient: AuthClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token);

      // request 객체에 유저 정보 저장
      request.user = payload;
      if (payload.tenantId) {
        request.headers['x-tenant-id'] = payload.tenantId;
        this.cls.set('tenantId', payload.tenantId);
      }

      // 단일 세션 검증: Auth Service에 세션 유효성 확인 요청
      const isValidSession = await this.authClient.validateSession(payload.sub, payload.sid);
      if (!isValidSession) {
        throw new UnauthorizedException('Session is invalid or has been expired by another login');
      }

      // 비밀번호 변경 정책 검증
      if (payload.passwordChangeRequired) {
        const isAllowExpired = this.reflector.getAllAndOverride<boolean>(ALLOW_EXPIRED_PASSWORD_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);

        if (!isAllowExpired) {
          throw new UnauthorizedException({
            message: 'Password change is required',
            code: 'PASSWORD_CHANGE_REQUIRED',
          });
        }
      }
    }
    catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
