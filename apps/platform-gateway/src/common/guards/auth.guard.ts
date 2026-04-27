import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PERSONAL_KEY } from '@/common/decorators/personal.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import type { JWTPayload } from '@/common/types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.checkPublic(context)) {
      const request = context.switchToHttp().getRequest<Request>();
      const payload = this.verifyToken(request);

      this.handleBypass(context, payload);
      this.handlePersonal(context, request, payload);
    }

    return true;
  }

  private verifyToken(request: Request): JWTPayload {
    const [scheme, token] = request.headers['authorization']?.split(' ') || [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      return this.jwtService.verify<JWTPayload>(token);
    }
    catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private checkPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private handleBypass(context: ExecutionContext, payload: JWTPayload) {
    // Note: mfaRequired, termsRequired, passwordChangeRequired 등은 로그인/리프레시 시점에 마이크로서비스에서 예외로 처리됩니다.
  }

  private handlePersonal(context: ExecutionContext, request: Request, payload: JWTPayload) {
    const isPersonal = this.reflector.getAllAndOverride<boolean>(IS_PERSONAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPersonal) {
      const body = request.body as Record<string, unknown>;
      const query = request.query as Record<string, unknown>;
      const params = request.params as Record<string, unknown>;

      // 요청에서 id(UUID) 또는 userId(ID로 전송된 경우) 추출
      const requestId = (params?.id || params?.userId || body?.id || body?.userId || query?.id || query?.userId) as string | undefined;
      const tenantId = (params?.tenantId || body?.tenantId || query?.tenantId) as string | undefined;

      if (!requestId) {
        throw new ForbiddenException('Resource owner identification (id) is required');
      }

      // 토큰의 sub(DB ID)와 요청의 ID가 일치하는지 확인
      const isOwner = payload.sub === requestId;

      if (!isOwner) {
        throw new ForbiddenException('You do not have permission to access this personal resource');
      }

      if (!tenantId) {
        throw new ForbiddenException('Tenant identification is required');
      }
      if (payload.tenantId !== tenantId) {
        throw new ForbiddenException('You do not have permission to access this tenant resource');
      }
    }
  }
}
