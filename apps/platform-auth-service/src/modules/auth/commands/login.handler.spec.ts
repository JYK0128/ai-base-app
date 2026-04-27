import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { CryptoUtil } from '@/common/utils/crypto.util';

import { LoginCommand, LoginHandler } from './login.handler';

describe('LoginHandler', () => {
  it('attaches remainingAttempts to invalid credential failures', async () => {
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue({
      transactional: async <R>(callback: () => Promise<R>) => callback(),
    } as never);

    const account = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      status: 'ACTIVE',
      loginAttempts: 0,
      lockUntil: null,
      managers: {
        getItems: () => [{ status: 'ACTIVE', organization: { id: 'tenant-1' } }],
      },
      nextPasswordChangeAt: new Date('2099-01-01T00:00:00.000Z'),
      forcePasswordChange: false,
    };

    const managerAccountRepository = {
      findOne: vi.fn().mockResolvedValue(account),
    };
    const jwtService = {
      signAsync: vi.fn(),
    };
    const redisService = {
      ttl: vi.fn().mockResolvedValue(-2),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new LoginHandler(
      managerAccountRepository as never,
      jwtService as never,
      redisService as never,
    );

    const error = await handler.execute(new LoginCommand('test@example.com', 'wrong-password', '127.0.0.1'))
      .catch((caught: unknown) => caught as UnauthorizedException);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.getResponse()).toMatchObject({
      message: '이메일 또는 비밀번호가 일치하지 않습니다.',
      code: 'INVALID_CREDENTIALS',
      details: {
        remainingAttempts: 4,
      },
    });
  });

  it('attaches lock details when the account is locked', async () => {
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue({
      transactional: async <R>(callback: () => Promise<R>) => callback(),
    } as never);

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00.000Z'));

    const account = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      status: 'ACTIVE',
      loginAttempts: 5,
      lockUntil: new Date('2026-04-23T00:10:00.000Z'),
      managers: {
        getItems: () => [{ status: 'ACTIVE', organization: { id: 'tenant-1' } }],
      },
      nextPasswordChangeAt: new Date('2099-01-01T00:00:00.000Z'),
      forcePasswordChange: false,
    };

    const managerAccountRepository = {
      findOne: vi.fn().mockResolvedValue(account),
    };
    const jwtService = {
      signAsync: vi.fn(),
    };
    const redisService = {
      ttl: vi.fn().mockResolvedValue(-2),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new LoginHandler(
      managerAccountRepository as never,
      jwtService as never,
      redisService as never,
    );

    const error = await handler.execute(new LoginCommand('test@example.com', 'pass1234', '127.0.0.1'))
      .catch((caught: unknown) => caught as UnauthorizedException);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.getResponse()).toMatchObject({
      message: '로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.',
      code: 'ACCOUNT_LOCKED',
      details: {
        remainingAttempts: 0,
        retryAfterSeconds: 600,
        lockedUntil: '2026-04-23T00:10:00.000Z',
      },
    });

    vi.useRealTimers();
  });
});
