import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { JWTPayload } from 'jose';

import { BYPASS_KEY, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { IS_PERSONAL_KEY } from '@/common/decorators/personal.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.checkPublic(context)) {
      const request = context.switchToHttp().getRequest<Request & { user?: JWTPayload }>();
      const payload = this.verifyToken(request);
      request.user = payload;

      this.handleBypass(context, payload);
      this.handlePersonal(context, request, payload);
      this.handlePermissions(context, payload);
    }

    return true;
  }

  private verifyToken(request: Request): JWTPayload {
    const authorizationHeader = request.headers['authorization'];

    if (typeof authorizationHeader !== 'string') {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const [scheme, token] = authorizationHeader.split(' ');

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
    const bypassPolicies = (this.reflector.getAllAndOverride<string[]>(BYPASS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? []);

    // 비밀번호 변경이 필요한 토큰인데, 해당 정책 우회가 없는 경우
    if (payload.mustChangePassword && !bypassPolicies.some((p) => p === BYPASS_POLICIES.PASSWORD)) {
      throw new ForbiddenException('Password change is required before accessing this resource');
    }

    // MFA, 약관 동의 등 추가 정책도 여기서 확장 가능
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

      // 요청에서 accountId(UUID)로 전송된 값 추출
      const ownerId = (params?.id || params?.accountId || body?.id || body?.accountId || query?.id || query?.accountId) as string | undefined;
      const organizationId = (params?.organizationId || body?.organizationId || query?.organizationId) as string | undefined;

      if (!ownerId) {
        throw new ForbiddenException('Resource owner identification (id) is required');
      }

      // 토큰의 accountId(DB ID)와 요청의 ID가 일치하는지 확인
      const accountId = payload.accountId;
      const isOwner = accountId === ownerId;

      if (!isOwner) {
        throw new ForbiddenException('You do not have permission to access this personal resource');
      }

      if (organizationId && payload.organizationId && payload.organizationId !== organizationId) {
        throw new ForbiddenException('You do not have permission to access this organization resource');
      }
    }
  }

  private handlePermissions(context: ExecutionContext, payload: JWTPayload) {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }

    const userPermissions = payload.permissions ?? [];
    const hasPermission = requiredPermissions.every((required) =>
      userPermissions.some((owned) => owned === required),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to access this resource');
    }
  }
}
