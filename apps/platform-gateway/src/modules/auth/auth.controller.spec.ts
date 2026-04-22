import 'reflect-metadata';

import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  function createController() {
    const authService = {
      login: vi.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 'user-1',
        email: 'test@example.com',
        clientIp: '127.0.0.1',
        passwordChangeRequired: false,
      }),
      refresh: vi.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tenantId: 'tenant-1',
      }),
      logout: vi.fn().mockResolvedValue({ success: true }),
      permissions: vi.fn(),
      deferPasswordChange: vi.fn().mockResolvedValue(undefined),
      changePassword: vi.fn().mockResolvedValue(undefined),
    };
    const controller = new AuthController(authService as never);
    const response = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    return { controller, authService, response };
  }

  it('logs in and sets the refresh token cookie', async () => {
    const { controller, authService, response } = createController();

    const result = await controller.login(
      { email: 'test@example.com', password: 'pass1234' } as never,
      response as never,
    );

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass1234',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result).toMatchObject({
      accessToken: 'access-token',
      userId: 'user-1',
      email: 'test@example.com',
      clientIp: '127.0.0.1',
      passwordChangeRequired: false,
    });
  });

  it('refreshes tokens and rotates the refresh cookie', async () => {
    const { controller, authService, response } = createController();

    const result = await controller.refresh('refresh-token', response as never);

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result).toMatchObject({
      accessToken: 'new-access-token',
      tenantId: 'tenant-1',
    });
  });

  it('rejects refresh when cookie is missing', async () => {
    const { controller, response } = createController();

    await expect(controller.refresh(undefined as never, response as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs out and clears the refresh cookie', async () => {
    const { controller, authService, response } = createController();
    const request = {
      user: { sub: 'user-1' },
    };

    const result = await controller.logout(request as never, response as never);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
    expect(authService.logout).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ success: true });
  });

  it('delegates password deferment and change requests', async () => {
    const { controller, authService } = createController();

    await controller.deferPasswordChange({ sub: 'user-1' } as never);
    await controller.changePassword(
      { sub: 'user-1' } as never,
      { currentPassword: 'current-password', newPassword: 'new-password' } as never,
    );

    expect(authService.deferPasswordChange).toHaveBeenCalledWith('user-1');
    expect(authService.changePassword).toHaveBeenCalledWith('user-1', {
      currentPassword: 'current-password',
      newPassword: 'new-password',
    });
  });
});
