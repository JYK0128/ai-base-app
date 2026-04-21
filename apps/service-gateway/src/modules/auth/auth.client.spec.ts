import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_SERVICE_PATTERNS } from './auth.constants';
import { AuthClient } from './auth.client';

describe('AuthClient', () => {
  const sendMock = vi.fn();
  const clsMock = {
    get: vi.fn(),
  };

  let client: AuthClient;

  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockReset();
    clsMock.get.mockReset();

    sendMock.mockReturnValue(of({}));
    client = new AuthClient(
      {
        send: sendMock,
      } as never,
      clsMock as never,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injects trace metadata when logging in', async () => {
    clsMock.get.mockImplementation((key: string) => {
      if (key === 'traceId') return 'trace-1';
      if (key === 'ip') return '127.0.0.1';
      return undefined;
    });
    sendMock.mockReturnValue(of({ accessToken: 'access-token', refreshToken: 'refresh-token' }));

    const result = await client.login({
      email: 'user@example.com',
      password: 'secret123',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(sendMock).toHaveBeenCalledWith(AUTH_SERVICE_PATTERNS.LOGIN, {
      email: 'user@example.com',
      password: 'secret123',
      traceId: 'trace-1',
      clientIp: '127.0.0.1',
    });
  });

  it('sends refresh token with trace metadata', async () => {
    clsMock.get.mockImplementation((key: string) => {
      if (key === 'traceId') return 'trace-2';
      if (key === 'ip') return '127.0.0.2';
      return undefined;
    });
    sendMock.mockReturnValue(of({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' }));

    const result = await client.refresh('refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(sendMock).toHaveBeenCalledWith(AUTH_SERVICE_PATTERNS.REFRESH, {
      refreshToken: 'refresh-token',
      traceId: 'trace-2',
      clientIp: '127.0.0.2',
    });
  });

  it('sends logout request with trace metadata', async () => {
    clsMock.get.mockImplementation((key: string) => {
      if (key === 'traceId') return 'trace-3';
      if (key === 'ip') return '127.0.0.3';
      return undefined;
    });
    sendMock.mockReturnValue(of(undefined));

    await client.logout('user-1');

    expect(sendMock).toHaveBeenCalledWith(AUTH_SERVICE_PATTERNS.LOGOUT, {
      userId: 'user-1',
      traceId: 'trace-3',
      clientIp: '127.0.0.3',
    });
  });
});
