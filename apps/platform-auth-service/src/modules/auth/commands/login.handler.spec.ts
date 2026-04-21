import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ManagerAccountRepository, UserAccountRepository } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/common/env';
import { CryptoUtil } from '@/common/utils/crypto.util';

import { RedisService } from '../../redis/redis.service';
import { LoginCommand, LoginHandler } from './login.handler';

vi.mock('@pkg/database', () => ({
  ManagerAccountRepository: class ManagerAccountRepository {},
  UserAccountRepository: class UserAccountRepository {},
}));

vi.mock('@/common/env', () => ({
  ENV: {
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: 3600,
  },
}));

vi.mock('@/common/utils/crypto.util', () => ({
  CryptoUtil: {
    comparePassword: vi.fn(),
  },
}));

describe('LoginHandler', () => {
  const managerFindOneMock = vi.fn();
  const userFindOneMock = vi.fn();
  const signAsyncMock = vi.fn();
  const ttlMock = vi.fn();
  const incrMock = vi.fn();
  const expireMock = vi.fn();
  const setMock = vi.fn();
  const delMock = vi.fn();

  let handler: LoginHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    managerFindOneMock.mockReset();
    userFindOneMock.mockReset();
    signAsyncMock.mockReset();
    ttlMock.mockReset();
    incrMock.mockReset();
    expireMock.mockReset();
    setMock.mockReset();
    delMock.mockReset();

    handler = new LoginHandler(
      {
        findOne: managerFindOneMock,
      } as unknown as ManagerAccountRepository,
      {
        findOne: userFindOneMock,
      } as unknown as UserAccountRepository,
      {
        signAsync: signAsyncMock,
      } as unknown as JwtService,
      {
        get: vi.fn(),
        set: setMock,
        del: delMock,
        incr: incrMock,
        expire: expireMock,
        ttl: ttlMock,
      } as unknown as RedisService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes email and returns tokens for a manager account', async () => {
    ttlMock.mockResolvedValue(0);
    managerFindOneMock.mockResolvedValue({
      id: 'manager-1',
      email: 'ops@example.com',
      password: 'hashed-password',
      managers: {
        getItems: () => [
          {
            organization: {
              id: 'org-1',
              code: 'acme',
              name: 'Acme',
            },
          },
        ],
      },
    });
    userFindOneMock.mockResolvedValue(null);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
    signAsyncMock
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await handler.execute(
      new LoginCommand('  OPS@EXAMPLE.COM  ', 'secret123', '127.0.0.1'),
    );

    expect(result).toMatchObject({
      userId: 'manager-1',
      email: 'ops@example.com',
      accountType: 'manager',
      clientIp: '127.0.0.1',
      tenantId: 'org-1',
      tenantType: 'organization',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(managerFindOneMock).toHaveBeenCalledWith(
      { email: 'ops@example.com' },
      expect.objectContaining({ populate: ['managers.organization'] }),
    );
    expect(userFindOneMock).not.toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith('refresh:manager-1', 'refresh-token', ENV.JWT_REFRESH_EXPIRES_IN);
    expect(delMock).toHaveBeenCalledWith('login_attempt:ops@example.com');
    expect(delMock).toHaveBeenCalledWith('login_lock:ops@example.com');
  });

  it('records a login failure when the password does not match', async () => {
    ttlMock.mockResolvedValue(0);
    managerFindOneMock.mockResolvedValue({
      id: 'manager-1',
      email: 'ops@example.com',
      password: 'hashed-password',
      managers: {
        getItems: () => [
          {
            organization: {
              id: 'org-1',
              code: 'acme',
              name: 'Acme',
            },
          },
        ],
      },
    });
    userFindOneMock.mockResolvedValue(null);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);
    incrMock.mockResolvedValue(1);

    await expect(
      handler.execute(new LoginCommand('ops@example.com', 'wrong-password', '127.0.0.1')),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(incrMock).toHaveBeenCalledWith('login_attempt:ops@example.com');
    expect(expireMock).toHaveBeenCalledWith('login_attempt:ops@example.com', 15 * 60);
    expect(setMock).not.toHaveBeenCalled();
  });

  it('locks the email after repeated failures', async () => {
    ttlMock.mockResolvedValue(0);
    managerFindOneMock.mockResolvedValue({
      id: 'manager-1',
      email: 'ops@example.com',
      password: 'hashed-password',
      managers: {
        getItems: () => [
          {
            organization: {
              id: 'org-1',
              code: 'acme',
              name: 'Acme',
            },
          },
        ],
      },
    });
    userFindOneMock.mockResolvedValue(null);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);
    incrMock
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        handler.execute(new LoginCommand('ops@example.com', 'wrong-password', '127.0.0.1')),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    expect(setMock).toHaveBeenCalledWith('login_lock:ops@example.com', 'locked', 15 * 60);
    expect(delMock).toHaveBeenCalledWith('login_attempt:ops@example.com');
  });

  it('blocks login while the email is locked', async () => {
    ttlMock.mockResolvedValue(120);

    const compareSpy = vi.spyOn(CryptoUtil, 'comparePassword');
    await expect(
      handler.execute(new LoginCommand('ops@example.com', 'secret123', '127.0.0.1')),
    ).rejects.toThrow('로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.');

    expect(managerFindOneMock).not.toHaveBeenCalled();
    expect(userFindOneMock).not.toHaveBeenCalled();
    expect(incrMock).not.toHaveBeenCalled();
    expect(compareSpy).not.toHaveBeenCalled();
  });
});
