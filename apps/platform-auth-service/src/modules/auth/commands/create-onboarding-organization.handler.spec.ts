import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
import { AccountStatus } from '@pkg/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateOnboardingOrganizationCommand, CreateOnboardingOrganizationHandler } from './create-onboarding-organization.handler';

describe('CreateOnboardingOrganizationHandler', () => {
  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('token'),
  };

  const mockRedisService = {
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(RequestContext, 'getEntityManager').mockReturnValue({
      transactional: async <R>(callback: () => Promise<R>) => callback(),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an organization, assigns it to the manager, and grants the default role', async () => {
    const account = {
      id: 'account-1',
      status: AccountStatus.ACTIVE,
      manager: {
        id: 'manager-1',
        organization: null as unknown,
      },
    };
    const organization = { id: 'org-1', code: 'acme' };
    const role = { id: 'role-1', code: 'organization_admin' };

    const handler = new CreateOnboardingOrganizationHandler(
      { findOne: vi.fn().mockResolvedValue(account) } as never,
      {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockReturnValue(organization),
      } as never,
      { findOne: vi.fn().mockResolvedValue(role) } as never,
      { create: vi.fn() } as never,
      mockJwtService as never,
      mockRedisService as never,
    );

    const result = await handler.execute(
      new CreateOnboardingOrganizationCommand('account-1', 'Acme', 'acme', 'admin@acme.example'),
    );

    expect(account.manager.organization).toBe(organization);
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(mockRedisService.set).toHaveBeenCalledWith('refresh:account-1', 'token', expect.any(Number));
  });
});
