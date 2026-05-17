import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AccountStatus } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CryptoUtil } from '@/common/utils/crypto.util';

import { ChangePasswordHandler } from './change-password.handler';
import { ChangePasswordCommand } from './change-password.helpers';

describe('ChangePasswordHandler', () => {
  function mockTransactionalContext() {
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue({
      transactional: async <R>(callback: () => Promise<R>) => callback(),
    } as never);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00.000Z'));
    mockTransactionalContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockAccount = (overrides = {}) => ({
    id: 'user-1',
    password: 'hashed-current',
    status: AccountStatus.ACTIVE,
    lockUntil: null,
    passwordExpiresAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  it('updates the password and password policy fields on success', async () => {
    const account = createMockAccount();
    const repository = {
      findOne: vi.fn().mockResolvedValue(account),
    };

    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(true);
    vi.spyOn(CryptoUtil, 'hashPassword').mockResolvedValue('hashed-new-password');

    const handler = new ChangePasswordHandler(repository as never);

    await handler.execute(new ChangePasswordCommand('user-1', 'current-password', 'new-password'));

    expect(repository.findOne).toHaveBeenCalledWith('user-1');
    expect(CryptoUtil.comparePassword).toHaveBeenCalledWith('current-password', 'hashed-current');
    expect(CryptoUtil.hashPassword).toHaveBeenCalledWith('new-password');
    expect(account.password).toBe('hashed-new-password');
    expect(account.passwordExpiresAt.toISOString()).toBe('2026-07-22T00:00:00.000Z');
  });

  it('throws UnauthorizedException when the account is INACTIVE', async () => {
    const account = createMockAccount({ status: AccountStatus.INACTIVE });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'pass', 'new')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the account is locked', async () => {
    const account = createMockAccount({ lockUntil: new Date('2026-04-23T00:10:00.000Z') });
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'pass', 'new')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws BadRequestException when the current password does not match', async () => {
    const account = createMockAccount();
    const repository = { findOne: vi.fn().mockResolvedValue(account) };

    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'wrong-password', 'new-password')),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when the account cannot be found', async () => {
    const repository = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('missing-user', 'current-password', 'new-password')),
    ).rejects.toThrow(NotFoundException);
  });
});
