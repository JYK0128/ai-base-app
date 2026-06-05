import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { AccountStatus, MemberStatus, OrganizationStatus } from '@pkg/database';
import * as CommonUtils from '@pkg/shared/common';
import * as ServerUtils from '@pkg/shared/server';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { ENV } from '@/env';

import { LoginCommand } from './login.command';
import { LoginHandler } from './login.handler';

const FIXED_NOW = new Date('2026-04-23T00:00:00.000Z');
const getExpectedExpiresAt = (secondsFromNow: number) => Math.floor(FIXED_NOW.getTime() / 1000) + secondsFromNow;
const getExpectedJwtOptions = () => ({
  access: {
    secret: ENV.JWT_ACCESS_SECRET,
    expires: getExpectedExpiresAt(ENV.JWT_ACCESS_EXPIRES_IN),
  },
  refresh: {
    secret: ENV.JWT_REFRESH_SECRET,
    expires: getExpectedExpiresAt(ENV.JWT_REFRESH_EXPIRES_IN),
  },
});

describe('LoginHandler', () => {
  let issuePairSpy: MockInstance<typeof CommonUtils.JwtUtil.issuePair>;

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
    issuePairSpy = vi.spyOn(CommonUtils.JwtUtil, 'issuePair').mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockRedisService.ttl.mockResolvedValue(-2);
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockAccount = (overrides: Record<string, unknown> = {}) => {
    const memberOverrides = (overrides.member as Record<string, unknown>) || {};
    const organization = {
      id: 'org-1',
      status: OrganizationStatus.ACTIVE,
      ...((memberOverrides.organization as Record<string, unknown>) || {}),
    };
    Object.defineProperty(organization, 'isActive', {
      enumerable: true,
      configurable: true,
      get: () => organization.status === OrganizationStatus.ACTIVE,
    });

    const member = {
      id: 'member-1',
      status: MemberStatus.ACTIVE,
      organizationRoles: { getItems: () => [] },
      organization,
      ...memberOverrides,
    };
    Object.defineProperty(member, 'isActive', {
      enumerable: true,
      configurable: true,
      get: () => member.status === MemberStatus.ACTIVE,
    });

    const account = {
      id: 'account-1',
      email: 'test@example.com',
      password: 'hashed-password',
      status: AccountStatus.ACTIVE,
      lastLoginAt: new Date('2026-04-20T00:00:00.000Z'),
      passwordExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
      lastLoginIp: null as string | null,
      member,
      verifyPassword: (password: string) => password !== 'wrong-pass',
    };

    const restOverrides = { ...overrides };
    delete restOverrides.member;
    Object.assign(account, restOverrides);
    Object.defineProperties(account, {
      isActive: {
        enumerable: true,
        configurable: true,
        get: () => account.status === AccountStatus.ACTIVE,
      },
      isDormant: {
        enumerable: true,
        configurable: true,
        get: () => !!account.lastLoginAt && Date.now() - account.lastLoginAt.getTime() > 90 * 24 * 60 * 60 * 1000,
      },
      isPasswordExpired: {
        enumerable: true,
        configurable: true,
        get: () => !account.passwordExpiresAt || account.passwordExpiresAt.getTime() < Date.now(),
      },
    });
    return account;
  };

  it('successfully logs in and returns tokens', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    vi.spyOn(ServerUtils.PasswordUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockRedisService as never);
    const result = (await handler.execute(
      new LoginCommand('test@example.com', 'password123', '127.0.0.1'),
    )) as { accessToken: string, refreshToken: string };

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(issuePairSpy).toHaveBeenCalledWith(
      {
        sub: account.id,
        accountId: account.id,
        memberId: account.member.id,
        organizationId: account.member.organization.id,
        mustChangePassword: false,
        permissions: [],
      },
      getExpectedJwtOptions(),
    );
    expect(account.lastLoginAt?.toISOString()).toBe('2026-04-23T00:00:00.000Z');
    expect(account.lastLoginIp).toBe('127.0.0.1');
  });

  it('successfully logs in without organization context', async () => {
    const account = createMockAccount({ member: { organization: undefined } });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    vi.spyOn(ServerUtils.PasswordUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockRedisService as never);
    const result = (await handler.execute(
      new LoginCommand('test@example.com', 'password123', '127.0.0.1'),
    )) as { accessToken: string, refreshToken: string };

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(issuePairSpy).toHaveBeenCalledWith(
      {
        sub: account.id,
        accountId: account.id,
        memberId: account.member.id,
        mustChangePassword: false,
        permissions: [],
      },
      getExpectedJwtOptions(),
    );
  });

  it('throws INVALID_CREDENTIALS when password does not match and tracks attempts', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };
    mockRedisService.incr.mockResolvedValue(1);
    vi.spyOn(ServerUtils.PasswordUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    const promise = handler.execute(new LoginCommand('test@example.com', 'wrong-pass', '127.0.0.1'));

    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toMatchObject({
      response: { code: 'INVALID_CREDENTIALS' },
    });
    expect(mockRedisService.incr).toHaveBeenCalled();
  });

  it('throws INVALID_CREDENTIALS when account does not exist and tracks attempts', async () => {
    const repository = { findOne: vi.fn().mockResolvedValue(null) };
    mockRedisService.incr.mockResolvedValue(1);

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    const promise = handler.execute(new LoginCommand('nonexistent@example.com', 'pass', '127.0.0.1'));

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

  it('throws INACTIVE_MEMBER when member status is INACTIVE', async () => {
    const account = createMockAccount({ member: { status: MemberStatus.INACTIVE } });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(
      handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1')),
    ).rejects.toMatchObject({
      response: { code: 'INACTIVE_MEMBER' },
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
    vi.spyOn(ServerUtils.PasswordUtil, 'comparePassword').mockResolvedValue(true);

    const handler = new LoginHandler(repository as never, mockRedisService as never);

    await expect(handler.execute(new LoginCommand('test@example.com', 'pass', '127.0.0.1'))).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(issuePairSpy).toHaveBeenCalledWith(
      {
        sub: account.id,
        accountId: account.id,
        memberId: account.member.id,
        organizationId: account.member.organization.id,
        mustChangePassword: true,
        permissions: [],
      },
      getExpectedJwtOptions(),
    );
  });
});
