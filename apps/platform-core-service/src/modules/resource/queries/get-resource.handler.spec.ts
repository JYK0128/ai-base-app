import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Resource, ResourceScope, ResourceType } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetResourceHandler } from './get-resource.handler';
import { GetResourceQuery } from './get-resource.query';

describe('GetResourceHandler', () => {
  let em: EntityManager;
  let handler: GetResourceHandler;
  let findOneMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findOneMock = vi.fn();
    em = {
      findOne: findOneMock,
    } as unknown as EntityManager;

    handler = new GetResourceHandler(em);
  });

  it('returns a single platform resource', async () => {
    const resource = {
      id: 'res-1',
      code: 'RESOURCE',
      name: '권한 관리',
      type: ResourceType.MENU,
      scope: ResourceScope.PLATFORM,
      path: '/resources',
      icon: 'Key',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      constraint: undefined,
      parent: { id: 'parent-1' } as Resource,
    } as unknown as Resource;

    findOneMock.mockResolvedValueOnce(resource);

    const result = await handler.execute(new GetResourceQuery('res-1'));

    expect(result).toEqual({
      id: 'res-1',
      code: 'RESOURCE',
      name: '권한 관리',
      type: ResourceType.MENU,
      scope: ResourceScope.PLATFORM,
      path: '/resources',
      icon: 'Key',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      constraint: undefined,
      parentId: 'parent-1',
    });

    expect(findOneMock).toHaveBeenCalledWith(
      expect.any(Function),
      { id: 'res-1' },
      { populate: ['parent'] },
    );
  });

  it('throws when resource is missing', async () => {
    findOneMock.mockResolvedValueOnce(null);

    await expect(handler.execute(new GetResourceQuery('missing')))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });
});
