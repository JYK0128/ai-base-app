import { UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authServiceMock = {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };

  const resMock = () => ({
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  });

  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.login.mockReset();
    authServiceMock.refresh.mockReset();
    authServiceMock.logout.mockReset();
    controller = new AuthController(authServiceMock as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets refresh token cookie and returns access token on login', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    const res = resMock();

    const result = await controller.login(
      { email: 'user@example.com', password: 'secret123' } as never,
      res as never,
    );

    expect(result).toEqual({
      accessToken: 'access-token',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('throws when refresh token cookie is missing', async () => {
    await expect(
      controller.refresh(undefined as never, resMock() as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(authServiceMock.refresh).not.toHaveBeenCalled();
  });

  it('refreshes tokens and updates refresh cookie', async () => {
    authServiceMock.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    const res = resMock();

    const result = await controller.refresh('current-refresh-token', res as never);

    expect(result).toEqual({
      accessToken: 'new-access-token',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    expect(authServiceMock.refresh).toHaveBeenCalledWith('current-refresh-token');
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('clears refresh cookie on logout and delegates user id', async () => {
    authServiceMock.logout.mockResolvedValue(undefined);
    const res = resMock();

    const result = await controller.logout(
      { user: { sub: 'user-1' } } as never,
      res as never,
    );

    expect(result).toBeUndefined();
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
    expect(authServiceMock.logout).toHaveBeenCalledWith('user-1');
  });

  it('returns current user payload on me', () => {
    const user = { sub: 'user-1', email: 'user@example.com', accountType: 'user' } as never;

    expect(controller.getMe(user)).toEqual({
      message: '사용자 정보를 성공적으로 가져왔습니다.',
      user,
    });
  });
});
