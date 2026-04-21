import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/common/env';

import { RedisService } from '../../redis/redis.service';
import { RefreshTokenCommand, RefreshTokenHandler } from './refresh-token.handler';

vi.mock('@/common/env', () => ({
  ENV: {
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: 3600,
  },
}));

describe('RefreshTokenHandler', () => {
  const verifyAsyncMock = vi.fn();
  const signAsyncMock = vi.fn();
  const getMock = vi.fn();
  const setMock = vi.fn();

  let handler: RefreshTokenHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    verifyAsyncMock.mockReset();
    signAsyncMock.mockReset();
    getMock.mockReset();
    setMock.mockReset();

    handler = new RefreshTokenHandler(
      {
        verifyAsync: verifyAsyncMock,
        signAsync: signAsyncMock,
      } as unknown as JwtService,
      {
        get: getMock,
        set: setMock,
        del: vi.fn(),
        incr: vi.fn(),
        expire: vi.fn(),
        ttl: vi.fn(),
      } as unknown as RedisService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rotates refresh tokens when the stored token matches', async () => {
    verifyAsyncMock.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      accountType: 'user',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    getMock.mockResolvedValue('current-refresh-token');
    signAsyncMock
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await handler.execute(
      new RefreshTokenCommand('current-refresh-token'),
    );

    expect(result).toMatchObject({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    expect(verifyAsyncMock).toHaveBeenCalledWith('current-refresh-token', {
      secret: ENV.JWT_REFRESH_SECRET,
    });
    expect(getMock).toHaveBeenCalledWith('refresh:user-1');
    expect(signAsyncMock).toHaveBeenCalledTimes(2);
    expect(setMock).toHaveBeenCalledWith('refresh:user-1', 'new-refresh-token', ENV.JWT_REFRESH_EXPIRES_IN);
  });

  it('rejects when the refresh token is missing from redis', async () => {
    verifyAsyncMock.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      accountType: 'user',
      tenantId: 'org-1',
      tenantType: 'organization',
    });
    getMock.mockResolvedValue(null);

    await expect(
      handler.execute(new RefreshTokenCommand('invalid-refresh-token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(setMock).not.toHaveBeenCalled();
  });

  it('rejects when jwt verification fails', async () => {
    verifyAsyncMock.mockRejectedValue(new Error('invalid'));

    await expect(
      handler.execute(new RefreshTokenCommand('broken-refresh-token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(getMock).not.toHaveBeenCalled();
    expect(setMock).not.toHaveBeenCalled();
  });
});
