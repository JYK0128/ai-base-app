import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mikro-orm/decorators/legacy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mikro-orm/decorators/legacy')>();
  return {
    ...actual,
    Transactional: () => (target: unknown, key: string, descriptor: PropertyDescriptor) => descriptor,
  };
});

import { CoreRepository, Resource, ResourceScope, ResourceType } from '@pkg/database';

import { UpdateResourcePermissionsCommand } from './update-resource-permissions.command';
import { UpdateResourcePermissionsHandler } from './update-resource-permissions.handler';

describe('UpdateResourcePermissionsHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
    find: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourcePermissionsHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
    };

    handler = new UpdateResourcePermissionsHandler(
      resourceRepo as unknown as CoreRepository<Resource>,
    );
  });

  it('updates actions and constraint of resource successfully', async () => {
    const resource = {
      id: 'res-1',
      actions: [],
      constraint: undefined,
      type: ResourceType.MENU,
      scope: ResourceScope.ORGANIZATION,
    } as unknown as Resource;
    Object.defineProperties(resource, {
      isMenu: {
        enumerable: true,
        configurable: true,
        get: () => resource.type === ResourceType.MENU,
      },
    });

    const child = {
      id: 'child-1',
      type: ResourceType.COMPONENT,
      constraint: 'READ',
    } as unknown as Resource;
    Object.defineProperties(child, {
      isComponent: {
        enumerable: true,
        configurable: true,
        get: () => child.type === ResourceType.COMPONENT,
      },
    });

    resourceRepo.findOne.mockResolvedValueOnce(resource);
    resourceRepo.find.mockResolvedValueOnce([child]);

    const result = await handler.execute(
      new UpdateResourcePermissionsCommand(
        'res-1',
        ResourceScope.ORGANIZATION,
        ['CREATE', 'READ'],
        'READ',
      ),
    );

    expect(result).toEqual({ id: 'res-1' });
    expect(resource.actions).toEqual(['CREATE', 'READ']);
    expect(resource.constraint).toBe('READ');
  });
});
