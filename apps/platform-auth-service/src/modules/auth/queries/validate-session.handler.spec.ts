import 'reflect-metadata';

import { describe, expect, it, vi } from 'vitest';

import { ValidateSessionHandler, ValidateSessionQuery } from './validate-session.handler';

describe('ValidateSessionHandler', () => {
  it('returns true when the active session id matches', async () => {
    const redisService = {
      get: vi.fn().mockResolvedValue('sid-123'),
    };

    const handler = new ValidateSessionHandler(redisService as never);

    await expect(
      handler.execute(new ValidateSessionQuery('user-1', 'sid-123')),
    ).resolves.toBe(true);
  });

  it('returns false when the active session id does not match', async () => {
    const redisService = {
      get: vi.fn().mockResolvedValue('sid-999'),
    };

    const handler = new ValidateSessionHandler(redisService as never);

    await expect(
      handler.execute(new ValidateSessionQuery('user-1', 'sid-123')),
    ).resolves.toBe(false);
  });

  it('returns false when no active session exists', async () => {
    const redisService = {
      get: vi.fn().mockResolvedValue(null),
    };

    const handler = new ValidateSessionHandler(redisService as never);

    await expect(
      handler.execute(new ValidateSessionQuery('user-1', 'sid-123')),
    ).resolves.toBe(false);
  });
});
