import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { AccountStatus, ManagerStatus, OrganizationStatus } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CryptoUtil } from '@/common/utils/crypto.util';

import { LoginCommand, LoginHandler } from './login.handler';

describe('LoginHandler', () => {
  const mockEntityManager = {
    transactional: async <R>(callback: () => Promise<R>) => callback(),
  };

  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('Bearer test-token'),
  };

  const mockRedisService = {
    ttl: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue(mockEntityManager as never);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockAccount = (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    status: AccountStatus.ACTIVE,
    lastLoginAt: new Date('2026-04-20T00:00:00.000Z'),
    passwordExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
    lastLoginIp: null as string | null,
    manager: {
      status: ManagerStatus.ACTIVE,
      organization: {
        id: 'org-1',
        status: OrganizationStatus.ACTIVE,
      },
    },
    ...overrides,
  });

  it('successfully logs in and returns tokens', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2); // No lock
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);
    const result = await handler.execute(
      new LoginCommand('test@example.com', 'password123', '127.0.0.1'),
    );

    expect(result.accessToken).toMatch(/Bearer .+/);
    expect(result.refreshToken).toMatch(/Bearer .+/);
    expect(result.mustCreateOrganization).toBe(false);
    expect(account.lastLoginAt?.toISOString()).toBe('2026-04-23T00:00:00.000Z');
    expect(account.lastLoginIp).toBe('127.0.0.1');
    expect(mockRedisService.set).toHaveBeenCalledWith('refresh:user-1', 'Bearer test-token', expect.any(Number));
  });

  it('throws ACCOUNT_NOT_VERIFIED when account is pending verification', async () => {
    const account = createMockAccount({ status: AccountStatus.PENDING_VERIFICATION });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'ACCOUNT_NOT_VERIFIED' },
    });
  });

  it('returns an onboarding token marker when account has no organization', async () => {
    const account = createMockAccount({
      manager: {
        status: ManagerStatus.ACTIVE,
        organization: null,
      },
    });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);
    const result = await handler.execute(new LoginCommand('test@example.com', 'password123', '127.0.0.1'));

    expect(result.mustCreateOrganization).toBe(true);
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-1',
        organizationId: undefined,
        mustCreateOrganization: true,
      }),
      expect.any(Object),
    );
  });

  it('throws INVALID_CREDENTIALS when password does not match and tracks attempts', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);
    mockRedisService.incr.mockResolvedValue(1);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

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

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

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
    mockRedisService.ttl.mockResolvedValue(-2);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'INACTIVE_ACCOUNT' },
    });
  });

  it('throws INACTIVE_MANAGER when manager status is INACTIVE', async () => {
    const account = createMockAccount({ manager: { status: ManagerStatus.INACTIVE } });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'INACTIVE_MANAGER' },
    });
  });

  it('throws DORMANT_ACCOUNT when last login was more than 90 days ago', async () => {
    const account = createMockAccount({ lastLoginAt: new Date('2025-01-01T00:00:00.000Z') });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'DORMANT_ACCOUNT' },
    });
  });

  it('marks tokens with mustChangePassword when password has expired', async () => {
    const account = createMockAccount({ passwordExpiresAt: new Date('2026-04-20T00:00:00.000Z') });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.ttl.mockResolvedValue(-2);
    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockJwtService as never, mockRedisService as never);

    await handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1'));

    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        mustChangePassword: true,
      }),
      expect.any(Object),
    );
  });
});
