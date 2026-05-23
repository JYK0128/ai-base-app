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

import { UpdateResourceSortCommand } from './update-resource-sort.command';
import { UpdateResourceSortHandler } from './update-resource-sort.handler';

describe('UpdateResourceSortHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
  };
  let em: {
    transactional: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourceSortHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
    };
    em = {
      transactional: vi.fn().mockImplementation((cb: (transactionalEm: EntityManager) => Promise<unknown>) => cb(em as unknown as EntityManager)),
    };
    handler = new UpdateResourceSortHandler(
      resourceRepo as unknown as ResourceRepository,
      em as unknown as EntityManager,
    );
  });

  it('updates sortOrder of resource successfully', async () => {
    const resource = {
      id: 'res-1',
      sortOrder: 1,
    } as unknown as Resource;

    resourceRepo.findOne.mockResolvedValueOnce(resource);

    const result = await handler.execute(
      new UpdateResourceSortCommand('res-1', 42),
    );

    expect(result).toEqual({ id: 'res-1' });
    expect(resource.sortOrder).toBe(42);
  });
});
