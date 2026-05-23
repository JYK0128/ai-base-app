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

import { UpdateResourceDetailCommand } from './update-resource-detail.command';
import { UpdateResourceDetailHandler } from './update-resource-detail.handler';

describe('UpdateResourceDetailHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
  };
  let em: {
    transactional: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourceDetailHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
    };
    em = {
      transactional: vi.fn().mockImplementation((cb: (transactionalEm: EntityManager) => Promise<unknown>) => cb(em as unknown as EntityManager)),
    };
    handler = new UpdateResourceDetailHandler(
      resourceRepo as unknown as ResourceRepository,
      em as unknown as EntityManager,
    );
  });

  it('updates resource details successfully when code is not duplicated', async () => {
    const resource = {
      id: 'res-1',
      code: 'OLD_CODE',
      name: 'Old Name',
      path: '/old',
      icon: 'OldIcon',
    } as unknown as Resource;

    // First findOne for identifyResource, second findOne for validateNoDuplicateCode
    resourceRepo.findOne
      .mockResolvedValueOnce(resource) // identifyResource
      .mockResolvedValueOnce(null);    // validateNoDuplicateCode

    const result = await handler.execute(
      new UpdateResourceDetailCommand('res-1', 'NEW_CODE', 'New Name', '/new', 'NewIcon'),
    );

    expect(result).toEqual({ id: 'res-1' });
    expect(resource.code).toBe('NEW_CODE');
    expect(resource.name).toBe('New Name');
    expect(resource.path).toBe('/new');
    expect(resource.icon).toBe('NewIcon');
  });

  it('throws error when a duplicate resource code exists', async () => {
    const resource = {
      id: 'res-1',
      code: 'OLD_CODE',
    } as unknown as Resource;

    const duplicateResource = {
      id: 'res-2',
      code: 'NEW_CODE',
    } as unknown as Resource;

    resourceRepo.findOne
      .mockResolvedValueOnce(resource)             // identifyResource
      .mockResolvedValueOnce(duplicateResource);   // validateNoDuplicateCode

    await expect(
      handler.execute(
        new UpdateResourceDetailCommand('res-1', 'NEW_CODE', 'New Name', '/new', 'NewIcon'),
      ),
    ).rejects.toThrow();
  });
});
