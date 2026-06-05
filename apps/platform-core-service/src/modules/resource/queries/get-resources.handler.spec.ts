import { EntityManager } from '@mikro-orm/core';
import { ResourceScope, ResourceType } from '@pkg/database';
import { ClsService } from 'nestjs-cls';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetResourcesHandler } from './get-resources.handler';
import { GetResourcesQuery } from './get-resources.query';

describe('GetResourcesHandler', () => {
  let em: EntityManager;
  let cls: ClsService;
  let handler: GetResourcesHandler;
  let findMock: ReturnType<typeof vi.fn>;
  let findOneMock: ReturnType<typeof vi.fn>;
  let getClsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findMock = vi.fn();
    findOneMock = vi.fn();
    getClsMock = vi.fn();
    cls = {
      get: getClsMock,
      set: vi.fn(),
      run: vi.fn(),
    } as unknown as ClsService;
    em = {
      find: findMock,
      findOne: findOneMock,
    } as unknown as EntityManager;

    handler = new GetResourcesHandler(em, cls);
  });

  it('preserves platform tree structure', async () => {
    const resources = [
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '권한 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.PLATFORM,
        icon: 'Key',
        sortOrder: 1,
        actions: ['READ', 'UPDATE'],
        constraint: undefined,
        parent: null,
      },
      {
        id: 'child-1',
        code: 'ROLE_RESOURCE_SAVE_BUTTON',
        name: '저장 버튼',
        type: ResourceType.COMPONENT,
        scope: ResourceScope.PLATFORM,
        icon: undefined,
        sortOrder: 2,
        actions: ['READ'],
        constraint: 'READ',
        parent: { id: 'root-1' },
      },
    ];

    findMock.mockResolvedValueOnce(resources);

    const result = await handler.execute(new GetResourcesQuery([], ResourceScope.PLATFORM, false));

    expect(result).toEqual([
      {
        id: 'root-1',
        code: 'RESOURCE',
        name: '권한 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.PLATFORM,
        path: undefined,
        icon: 'Key',
        sortOrder: 1,
        actions: ['READ', 'UPDATE'],
        constraint: undefined,
        children: [
          {
            id: 'child-1',
            code: 'ROLE_RESOURCE_SAVE_BUTTON',
            name: '저장 버튼',
            type: ResourceType.COMPONENT,
            scope: ResourceScope.PLATFORM,
            path: undefined,
            icon: undefined,
            sortOrder: 2,
            actions: ['READ'],
            constraint: 'READ',
            children: [],
          },
        ],
      },
    ]);

    expect(findMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      { scope: ResourceScope.PLATFORM },
      { populate: ['parent'], orderBy: { sortOrder: 'ASC', code: 'ASC' } },
    );
  });

  it('filters organization resources by permissions', async () => {
    const resources = [
      {
        id: 'org-root-1',
        icon: 'Key',
        sortOrder: 1,
        actions: ['READ'],
        constraint: undefined,
        code: 'RESOURCE',
        name: '권한 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.ORGANIZATION,
        path: '/resources',
        parent: null,
      },
      {
        id: 'org-child-1',
        icon: undefined,
        sortOrder: 2,
        actions: ['READ'],
        constraint: undefined,
        code: 'ROLE_RESOURCE_CREATE_BUTTON',
        name: '메뉴 추가 버튼',
        type: ResourceType.COMPONENT,
        scope: ResourceScope.ORGANIZATION,
        path: undefined,
        parent: { id: 'org-root-1' },
      },
    ];

    findMock.mockResolvedValueOnce(resources);

    const result = await handler.execute(
      new GetResourcesQuery(
        ['ROLE_RESOURCE_CREATE_BUTTON:READ'],
        ResourceScope.ORGANIZATION,
        true,
      ),
    );

    expect(result).toEqual([
      {
        id: 'org-root-1',
        code: 'RESOURCE',
        name: '권한 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.ORGANIZATION,
        path: '/resources',
        icon: 'Key',
        sortOrder: 1,
        actions: ['READ'],
        constraint: undefined,
        children: [
          {
            id: 'org-child-1',
            code: 'ROLE_RESOURCE_CREATE_BUTTON',
            name: '메뉴 추가 버튼',
            type: ResourceType.COMPONENT,
            scope: ResourceScope.ORGANIZATION,
            path: undefined,
            icon: undefined,
            sortOrder: 2,
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
      { scope: ResourceScope.ORGANIZATION },
      { populate: ['parent'], orderBy: { sortOrder: 'ASC', code: 'ASC' } },
    );
  });

  it('merges platform and organization resources for platform organization', async () => {
    const resources = [
      {
        id: 'org-root-1',
        icon: 'Users',
        sortOrder: 1,
        actions: ['READ'],
        constraint: undefined,
        code: 'MEMBER',
        name: '멤버 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.ORGANIZATION,
        path: '/members',
        parent: null,
      },
      {
        id: 'platform-root-1',
        icon: 'Key',
        sortOrder: 2,
        actions: ['READ'],
        constraint: undefined,
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.PLATFORM,
        path: '/resources',
        parent: null,
      },
    ];

    getClsMock.mockReturnValueOnce('org-platform');
    findOneMock.mockResolvedValueOnce({
      id: 'org-platform',
      code: 'platform',
    });
    findMock.mockResolvedValueOnce(resources);

    const result = await handler.execute(
      new GetResourcesQuery([], ResourceScope.ORGANIZATION, false),
    );

    expect(result).toEqual([
      {
        id: 'org-root-1',
        code: 'MEMBER',
        name: '멤버 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.ORGANIZATION,
        path: '/members',
        icon: 'Users',
        sortOrder: 1,
        actions: ['READ'],
        constraint: undefined,
        children: [],
      },
      {
        id: 'platform-root-1',
        code: 'RESOURCE',
        name: '리소스 관리',
        type: ResourceType.MENU,
        scope: ResourceScope.PLATFORM,
        path: '/resources',
        icon: 'Key',
        sortOrder: 2,
        actions: ['READ'],
        constraint: undefined,
        children: [],
      },
    ]);

    expect(findOneMock).toHaveBeenNthCalledWith(1, expect.any(Function), { id: 'org-platform' });
    expect(findMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      { scope: { $in: [ResourceScope.PLATFORM, ResourceScope.ORGANIZATION] } },
      { populate: ['parent'], orderBy: { sortOrder: 'ASC', code: 'ASC' } },
    );
  });

  it('filters out organization resources when read action is missing even if permission exists', async () => {
    const resources = [
      {
        id: 'org-root-1',
        icon: 'Key',
        sortOrder: 1,
        actions: [],
        constraint: undefined,
        code: 'AUDIT',
        name: '감사 로그',
        type: ResourceType.MENU,
        scope: ResourceScope.ORGANIZATION,
        path: '/audit',
        parent: null,
      },
    ];

    findMock.mockResolvedValueOnce(resources);

    getClsMock.mockReturnValueOnce(undefined);

    const result = await handler.execute(
      new GetResourcesQuery(
        ['AUDIT:READ'],
        ResourceScope.ORGANIZATION,
        true,
      ),
    );

    expect(result).toEqual([]);
  });
});
