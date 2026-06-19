import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { JWTPayload } from 'jose';
import { ClsService } from 'nestjs-cls';

import { BYPASS_KEY, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { IS_PERSONAL_KEY } from '@/common/decorators/personal.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.checkPublic(context)) {
      const request = context.switchToHttp().getRequest<Request & { user?: JWTPayload }>();
      const payload = this.verifyToken(request);
      request.user = payload;

      this.handleBypass(context);
      this.handlePersonal(context, request, payload);
      this.handlePermissions(context);
    }

    return true;
  }

  private verifyToken(request: Request): JWTPayload {
    const authorizationHeader = request.headers['authorization'];

    if (typeof authorizationHeader !== 'string') {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new UnauthorizedException('Authentication token is missing');
    }

    if (!token) {
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

  private handleBypass(context: ExecutionContext) {
    const bypassPolicies = this.reflector.getAllAndOverride<string[]>(BYPASS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const canBypassPassword = Array.isArray(bypassPolicies)
      && bypassPolicies.some((policy) => policy === BYPASS_POLICIES.PASSWORD);
    const canBypassTerms = Array.isArray(bypassPolicies)
      && bypassPolicies.some((policy) => policy === BYPASS_POLICIES.TERMS);
    const isPasswordExpired = this.cls.get('isPasswordExpired');
    const mustAcceptTerms = this.cls.get('mustAcceptTerms');

    if (typeof isPasswordExpired !== 'boolean' || typeof mustAcceptTerms !== 'boolean') {
      throw new UnauthorizedException('Request context is missing');
    }

    // 비밀번호 변경이 필요한 토큰인데, 해당 정책 우회가 없는 경우
    if (isPasswordExpired && !canBypassPassword) {
      throw new ForbiddenException('Password change is required before accessing this resource');
    }

    if (mustAcceptTerms && !canBypassTerms) {
      throw new ForbiddenException('Terms agreement is required before accessing this resource');
    }
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
      const ownerId = this.pickFirstString(
        params.id,
        params.accountId,
        body.id,
        body.accountId,
        query.id,
        query.accountId,
      );
      const organizationId = this.pickFirstString(
        params.organizationId,
        body.organizationId,
        query.organizationId,
      );

      if (!ownerId) {
        throw new ForbiddenException('Resource owner identification (id) is required');
      }

      // 토큰의 sub(DB ID)와 요청의 ID가 일치하는지 확인
      const accountId = payload.sub;
      const isOwner = accountId === ownerId;

      if (!isOwner) {
        throw new ForbiddenException('You do not have permission to access this personal resource');
      }

      const userOrgId = this.cls.get<string | undefined>('organizationId');
      if (organizationId && userOrgId && userOrgId !== organizationId) {
        throw new ForbiddenException('You do not have permission to access this organization resource');
      }
    }
  }

  private handlePermissions(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!Array.isArray(requiredPermissions)) {
      return;
    }

    if (requiredPermissions.length === 0) {
      return;
    }

    const userPermissions = this.cls.get('permissions');
    if (!Array.isArray(userPermissions)) {
      throw new UnauthorizedException('Request context is missing');
    }
    const hasPermission = requiredPermissions.every((required) =>
      userPermissions.some((owned) => owned === required),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to access this resource');
    }
  }

  private pickFirstString(...values: Array<unknown>): string | undefined {
    for (const value of values) {
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return undefined;
  }
}
