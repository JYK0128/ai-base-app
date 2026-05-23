import { EntityManager } from '@mikro-orm/postgresql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mikro-orm/decorators/legacy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mikro-orm/decorators/legacy')>();
  return {
    ...actual,
    Transactional: () => (target: unknown, key: string, descriptor: PropertyDescriptor) => descriptor,
  };
});

import { Resource, ResourceRepository } from '@pkg/database';

import { UpdateResourcePermissionsCommand } from './update-resource-permissions.command';
import { UpdateResourcePermissionsHandler } from './update-resource-permissions.handler';

describe('UpdateResourcePermissionsHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
  };
  let em: {
    transactional: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourcePermissionsHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
    };
    em = {
      transactional: vi.fn().mockImplementation((cb: (transactionalEm: EntityManager) => Promise<unknown>) => cb(em as unknown as EntityManager)),
    };
    handler = new UpdateResourcePermissionsHandler(
      resourceRepo as unknown as ResourceRepository,
      em as unknown as EntityManager,
    );
  });

  it('updates actions and constraint of resource successfully', async () => {
    const resource = {
      id: 'res-1',
      actions: [],
      constraint: undefined,
    } as unknown as Resource;

    resourceRepo.findOne.mockResolvedValueOnce(resource);

    const result = await handler.execute(
      new UpdateResourcePermissionsCommand('res-1', ['CREATE', 'READ'], 'READ'),
    );

    expect(result).toEqual({ id: 'res-1' });
    expect(resource.actions).toEqual(['CREATE', 'READ']);
    expect(resource.constraint).toBe('READ');
  });
});
