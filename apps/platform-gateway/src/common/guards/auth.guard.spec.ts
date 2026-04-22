import 'reflect-metadata';

import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { ALLOW_EXPIRED_PASSWORD_KEY } from '@/common/decorators/allow-expired-password.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

import { AuthGuard } from './auth.guard';

function createContext(request: Request, handler: object, classRef: object) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => handler,
    getClass: () => classRef,
  };
}

describe('AuthGuard', () => {
  const payload = {
    sub: 'user-1',
    email: 'test@example.com',
    sid: 'sid-123',
    tenantId: 'tenant-1',
    passwordChangeRequired: false,
  };

  function createGuard(options?: { isPublic?: boolean, allowExpired?: boolean, sessionValid?: boolean, payloadOverride?: Partial<typeof payload> }) {
    const request = {
      headers: {
        authorization: 'Bearer access-token',
        'user-agent': 'vitest',
      },
    } as Request;

    const reflector = {
      getAllAndOverride: vi.fn((key: string) => {
        if (key === IS_PUBLIC_KEY) return options?.isPublic ?? false;
        if (key === ALLOW_EXPIRED_PASSWORD_KEY) return options?.allowExpired ?? false;
        return false;
      }),
    } as unknown as Reflector;
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ ...payload, ...options?.payloadOverride }),
    } as unknown as JwtService;
    const cls = {
      set: vi.fn(),
      get: vi.fn(),
    } as any;
    const authClient = {
      validateSession: vi.fn().mockResolvedValue(options?.sessionValid ?? true),
    } as any;

    const guard = new AuthGuard(jwtService, reflector, cls, authClient);
    const context = createContext(request, {}, {});

    return { guard, context, request, reflector, jwtService, cls, authClient };
  }

  it('allows public routes without token verification', async () => {
    const { guard, context, jwtService, authClient } = createGuard({ isPublic: true });

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(authClient.validateSession).not.toHaveBeenCalled();
  });

  it('stores user info and validates the session', async () => {
    const { guard, context, request, cls, authClient } = createGuard();

    await expect(guard.canActivate(context as never)).resolves.toBe(true);

    expect(request.user).toMatchObject({
      sub: 'user-1',
      email: 'test@example.com',
      sid: 'sid-123',
    });
    expect(request.headers['x-tenant-id']).toBe('tenant-1');
    expect(cls.set).toHaveBeenCalledWith('tenantId', 'tenant-1');
    expect(authClient.validateSession).toHaveBeenCalledWith('user-1', 'sid-123');
  });

  it('rejects expired-password tokens unless the route is explicitly allowed', async () => {
    const { guard, context } = createGuard({
      payloadOverride: { passwordChangeRequired: true },
      allowExpired: false,
    });

    try {
      await guard.canActivate(context as never);
    }
    catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).getResponse()).toMatchObject({
        message: 'Password change is required',
        code: 'PASSWORD_CHANGE_REQUIRED',
      });
    }
  });

  it('rejects invalid sessions', async () => {
    const { guard, context } = createGuard({ sessionValid: false });

    try {
      await guard.canActivate(context as never);
    }
    catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).message).toContain('Session is invalid');
    }
  });
});
