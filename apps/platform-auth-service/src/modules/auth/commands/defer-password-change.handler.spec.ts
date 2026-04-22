import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeferPasswordChangeCommand, DeferPasswordChangeHandler } from './defer-password-change.handler';

describe('DeferPasswordChangeHandler', () => {
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

  it('extends the next password change date by 90 days', async () => {
    const account = {
      id: 'user-1',
      forcePasswordChange: false,
      nextPasswordChangeAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const repository = {
      findOne: vi.fn().mockResolvedValue(account),
    };

    const handler = new DeferPasswordChangeHandler(repository as never);

    await handler.execute(new DeferPasswordChangeCommand('user-1'));

    expect(repository.findOne).toHaveBeenCalledWith('user-1');
    expect(account.nextPasswordChangeAt.toISOString()).toBe('2026-07-22T00:00:00.000Z');
  });

  it('throws when the account cannot be found', async () => {
    const repository = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    const handler = new DeferPasswordChangeHandler(repository as never);

    await expect(
      handler.execute(new DeferPasswordChangeCommand('missing-user')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects deferment when password change is forced by admin', async () => {
    const account = {
      id: 'user-1',
      forcePasswordChange: true,
      nextPasswordChangeAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const repository = {
      findOne: vi.fn().mockResolvedValue(account),
    };

    const handler = new DeferPasswordChangeHandler(repository as never);

    await expect(
      handler.execute(new DeferPasswordChangeCommand('user-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
