import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeferPasswordChangeHandler } from './defer-password-change.handler';
import { DeferPasswordChangeCommand } from './defer-password-change.helpers';

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
      passwordExpiresAt: new Date('2026-01-01T00:00:00.000Z'),
      isActive: () => true,
      deferPasswordExpiry: (days: number) => {
        account.passwordExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
    };
    const repository = {
      findOne: vi.fn().mockResolvedValue(account),
    };

    const handler = new DeferPasswordChangeHandler(repository as never);

    await handler.execute(new DeferPasswordChangeCommand('user-1'));

    expect(repository.findOne).toHaveBeenCalledWith('user-1');
    expect(account.passwordExpiresAt.toISOString()).toBe('2026-07-22T00:00:00.000Z');
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
});
