import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CryptoUtil } from '@/common/utils/crypto.util';

import { ChangePasswordCommand, ChangePasswordHandler } from './change-password.handler';

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

  it('updates the password and password policy fields on success', async () => {
    const account = {
      id: 'user-1',
      password: 'hashed-current',
      passwordChangedAt: new Date('2026-01-01T00:00:00.000Z'),
      nextPasswordChangeAt: new Date('2026-01-01T00:00:00.000Z'),
      forcePasswordChange: true,
    };
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
    expect(account.passwordChangedAt.toISOString()).toBe('2026-04-23T00:00:00.000Z');
    expect(account.nextPasswordChangeAt.toISOString()).toBe('2026-07-22T00:00:00.000Z');
    expect(account.forcePasswordChange).toBe(false);
  });

  it('throws when the current password does not match', async () => {
    const account = {
      id: 'user-1',
      password: 'hashed-current',
    };
    const repository = {
      findOne: vi.fn().mockResolvedValue(account),
    };

    vi.spyOn(CryptoUtil, 'comparePassword').mockResolvedValue(false);

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'wrong-password', 'new-password')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the account cannot be found', async () => {
    const repository = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    const handler = new ChangePasswordHandler(repository as never);

    await expect(
      handler.execute(new ChangePasswordCommand('missing-user', 'current-password', 'new-password')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
