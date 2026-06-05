import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mikro-orm/decorators/legacy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mikro-orm/decorators/legacy')>();
  return {
    ...actual,
    Transactional: () => (target: unknown, key: string, descriptor: PropertyDescriptor) => descriptor,
  };
});

import { Resource, ResourceRepository, ResourceScope } from '@pkg/database';

import { UpdateResourceSortCommand } from './update-resource-sort.command';
import { UpdateResourceSortHandler } from './update-resource-sort.handler';

describe('UpdateResourceSortHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourceSortHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
    };

    handler = new UpdateResourceSortHandler(
      resourceRepo as unknown as ResourceRepository,
    );
  });

  it('updates sortOrder of resource successfully', async () => {
    const resource = {
      id: 'res-1',
      sortOrder: 1,
      scope: ResourceScope.ORGANIZATION,
    } as unknown as Resource;

    resourceRepo.findOne.mockResolvedValueOnce(resource);

    const result = await handler.execute(
      new UpdateResourceSortCommand(
        ResourceScope.ORGANIZATION,
        [{ id: 'res-1', sortOrder: 42 }],
      ),
    );

    expect(result).toEqual({ success: true });
    expect(resource.sortOrder).toBe(42);
  });
});
