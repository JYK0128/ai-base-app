import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { AccountStatus, ManagerStatus, OrganizationStatus } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { CryptoUtil } from '@/common/utils/crypto.util';
import { TokenUtil } from '@/common/utils/token.util';

import { LoginHandler } from './login.handler';
import { LoginCommand } from './login.helpers';

describe('LoginHandler', () => {
  let generateTokensSpy: MockInstance<typeof TokenUtil.generateTokens>;

  const mockEntityManager = {
    transactional: async <R>(callback: () => Promise<R>) => callback(),
  };

  const mockRedisService = {
    ttl: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue(mockEntityManager as never);
    generateTokensSpy = vi.spyOn(TokenUtil, 'generateTokens').mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockRedisService.ttl.mockResolvedValue(-2);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockAccount = (overrides: Record<string, unknown> = {}) => {
    const managerOverrides = (overrides.manager as Record<string, unknown>) || {};
    const account = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      status: AccountStatus.ACTIVE,
      lastLoginAt: new Date('2026-04-20T00:00:00.000Z'),
      passwordExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
      lastLoginIp: null as string | null,
      manager: {
        status: ManagerStatus.ACTIVE,
        isActive: () => account.manager.status === ManagerStatus.ACTIVE,
        organization: {
          id: 'org-1',
          status: OrganizationStatus.ACTIVE,
          isActive: () => account.manager.organization.status === OrganizationStatus.ACTIVE,
        },
        ...managerOverrides,
      },
      isActive: () => account.status === AccountStatus.ACTIVE,
      isDormant: () => !!account.lastLoginAt && Date.now() - account.lastLoginAt.getTime() > 90 * 24 * 60 * 60 * 1000,
      isPasswordExpired: () => !account.passwordExpiresAt || account.passwordExpiresAt.getTime() < Date.now(),
      verifyPassword: (password: string) => password !== 'wrong-pass',
    };

    const { manager, ...restOverrides } = overrides;
    return Object.assign(account, restOverrides);
  };

  it('successfully logs in and returns tokens', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockRedisService as never);
    const result = (await handler.execute(
      new LoginCommand('test@example.com', 'password123', '127.0.0.1'),
    )) as { accessToken: string, refreshToken: string };

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(generateTokensSpy).toHaveBeenCalledWith({
      sub: account.id,
      organizationId: account.manager.organization.id,
      mustChangePassword: false,
      roles: [],
      permissions: [],
    });
    expect(account.lastLoginAt?.toISOString()).toBe('2026-04-23T00:00:00.000Z');
    expect(account.lastLoginIp).toBe('127.0.0.1');
  });

  it('throws INVALID_CREDENTIALS when password does not match and tracks attempts', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.incr.mockResolvedValue(1);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    const promise = handler.execute(new LoginCommand('test@example.com', 'wrong-pass', '127.0.0.1'));

    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toMatchObject({
      response: { code: 'INVALID_CREDENTIALS' },
    });
    expect(mockRedisService.incr).toHaveBeenCalled();
  });

  it('throws ACCOUNT_LOCKED when redis has an active lock', async () => {
    const repository = { findOne: vi.fn() };
    mockRedisService.ttl.mockResolvedValue(600); // 10 minutes remaining

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    const promise = handler.execute(new LoginCommand('test@example.com', 'any-pass', '127.0.0.1'));

    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toMatchObject({
      response: {
        code: 'ACCOUNT_LOCKED',
        details: { retryAfterSeconds: 600 },
      },
    });
  });

  it('throws INACTIVE_ACCOUNT when account status is INACTIVE', async () => {
    const account = createMockAccount({ status: AccountStatus.INACTIVE });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'INACTIVE_ACCOUNT' },
    });
  });

  it('throws INACTIVE_MANAGER when manager status is INACTIVE', async () => {
    const account = createMockAccount({ manager: { status: ManagerStatus.INACTIVE } });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'INACTIVE_MANAGER' },
    });
  });

  it('throws DORMANT_ACCOUNT when last login was more than 90 days ago', async () => {
    const account = createMockAccount({ lastLoginAt: new Date('2025-01-01T00:00:00.000Z') });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'DORMANT_ACCOUNT' },
    });
  });

  it('marks the token as mustChangePassword when password has expired', async () => {
    const account = createMockAccount({ passwordExpiresAt: new Date('2026-04-20T00:00:00.000Z') });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1'))).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(generateTokensSpy).toHaveBeenCalledWith({
      sub: account.id,
      organizationId: account.manager.organization.id,
      mustChangePassword: true,
      roles: [],
      permissions: [],
    });
  });
});
