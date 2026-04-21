import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisService } from '../../redis/redis.service';
import { LogoutCommand, LogoutHandler } from './logout.handler';

describe('LogoutHandler', () => {
  const delMock = vi.fn();
  let handler: LogoutHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    delMock.mockReset();

    handler = new LogoutHandler({
      get: vi.fn(),
      set: vi.fn(),
      del: delMock,
      incr: vi.fn(),
      expire: vi.fn(),
      ttl: vi.fn(),
    } as unknown as RedisService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes the refresh token for the given user', async () => {
    delMock.mockResolvedValue(1);

    const result = await handler.execute(new LogoutCommand('user-1'));

    expect(result).toEqual({ success: true });
    expect(delMock).toHaveBeenCalledWith('refresh:user-1');
  });
});
