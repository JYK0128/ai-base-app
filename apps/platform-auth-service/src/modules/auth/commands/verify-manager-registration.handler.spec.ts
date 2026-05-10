import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { AccountStatus, ManagerAccountVerificationStatus } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VerifyManagerRegistrationCommand, VerifyManagerRegistrationHandler } from './verify-manager-registration.handler';

describe('VerifyManagerRegistrationHandler', () => {
  beforeEach(() => {
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue({
      transactional: async <R>(callback: () => Promise<R>) => callback(),
    } as never);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('activates the manager account with a valid token', async () => {
    const verification = {
      status: ManagerAccountVerificationStatus.PENDING,
      expiresAt: new Date('2026-05-11T00:00:00.000Z'),
      verifiedAt: null as Date | null,
      managerAccount: {
        status: AccountStatus.PENDING_VERIFICATION,
      },
    };
    const verificationRepository = {
      findOne: vi.fn().mockResolvedValue(verification),
    };
    const verificationTokenService = {
      hashToken: vi.fn().mockReturnValue('hashed-token'),
    };

    const handler = new VerifyManagerRegistrationHandler(
      verificationRepository as never,
      verificationTokenService as never,
    );

    await handler.execute(new VerifyManagerRegistrationCommand('plain-token'));

    expect(verificationTokenService.hashToken).toHaveBeenCalledWith('plain-token');
    expect(verification.status).toBe(ManagerAccountVerificationStatus.VERIFIED);
    expect(verification.verifiedAt?.toISOString()).toBe('2026-05-10T00:00:00.000Z');
    expect(verification.managerAccount.status).toBe(AccountStatus.ACTIVE);
  });

  it('marks an expired token as expired and rejects it', async () => {
    const verification = {
      status: ManagerAccountVerificationStatus.PENDING,
      expiresAt: new Date('2026-05-09T00:00:00.000Z'),
      managerAccount: {
        status: AccountStatus.PENDING_VERIFICATION,
      },
    };
    const verificationRepository = {
      findOne: vi.fn().mockResolvedValue(verification),
    };
    const verificationTokenService = {
      hashToken: vi.fn().mockReturnValue('hashed-token'),
    };

    const handler = new VerifyManagerRegistrationHandler(
      verificationRepository as never,
      verificationTokenService as never,
    );

    await expect(
      handler.execute(new VerifyManagerRegistrationCommand('plain-token')),
    ).rejects.toMatchObject({
      response: { code: 'TOKEN_EXPIRED' },
    });
    expect(verification.status).toBe(ManagerAccountVerificationStatus.EXPIRED);
  });
});
