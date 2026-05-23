import { EntityManager } from '@mikro-orm/core';
import { Resource, ResourceType } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetResourcesHandler } from './get-resources.handler';
import { GetResourcesQuery } from './get-resources.query';

describe('GetResourcesHandler', () => {
  let em: EntityManager;
  let handler: GetResourcesHandler;
  let findMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findMock = vi.fn();
    em = {
      find: findMock,
    } as unknown as EntityManager;

    handler = new GetResourcesHandler(em);
  });

  it('preserves tree structure', async () => {
    const resources = [
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        sortOrder: 2,
        actions: ['READ'],
        children: [] as never[],
      } as unknown as Resource,
      {
        id: 'child-1',
        code: 'ROLE_RESOURCE_SAVE_BUTTON',
        name: '저장 버튼',
        type: ResourceType.COMPONENT,
        parent: { id: 'root-1' } as unknown as Resource,
        sortOrder: 1,
        actions: ['READ'],
        children: [] as never[],
      } as unknown as Resource,
    ] as Resource[];

    findMock.mockResolvedValueOnce(resources);

    const result = await handler.execute(new GetResourcesQuery());

    expect(result).toEqual([
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        sortOrder: 2,
        actions: ['READ'],
        constraint: undefined,
        children: [
          {
            id: 'child-1',
            code: 'ROLE_RESOURCE_SAVE_BUTTON',
            name: '저장 버튼',
            type: ResourceType.COMPONENT,
            path: undefined,
            icon: undefined,
            sortOrder: 1,
            actions: ['READ'],
            constraint: undefined,
            children: [],
          },
        ],
      },
    ]);

    expect(findMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      {},
      { orderBy: { sortOrder: 'ASC' } },
    );
  });

  it('filters by permissions', async () => {
    findMock.mockReset();
    const resources = [
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        sortOrder: 1,
        actions: ['READ'],
        children: [] as never[],
      } as unknown as Resource,
      {
        id: 'child-1',
        code: 'ROLE_RESOURCE_CREATE_BUTTON',
        name: '메뉴 추가 버튼',
        type: ResourceType.COMPONENT,
        parent: { id: 'root-1' } as unknown as Resource,
        sortOrder: 1,
        actions: ['READ'],
        children: [] as never[],
      } as unknown as Resource,
    ] as Resource[];

    findMock.mockResolvedValueOnce(resources);

    const result = await handler.execute(new GetResourcesQuery(['ROLE_RESOURCE_CREATE_BUTTON:READ'], []));

    expect(result).toEqual([
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        sortOrder: 1,
        actions: ['READ'],
        constraint: undefined,
        children: [
          {
            id: 'child-1',
            code: 'ROLE_RESOURCE_CREATE_BUTTON',
            name: '메뉴 추가 버튼',
            type: ResourceType.COMPONENT,
            path: undefined,
            icon: undefined,
            sortOrder: 1,
            actions: ['READ'],
            constraint: undefined,
            children: [],
          },
        ],
      },
    ]);
  });
});
