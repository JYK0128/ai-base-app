import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mikro-orm/decorators/legacy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mikro-orm/decorators/legacy')>();
  return {
    ...actual,
    Transactional: () => (target: unknown, key: string, descriptor: PropertyDescriptor) => descriptor,
  };
});

import { Resource, ResourceRepository, ResourceScope } from '@pkg/database';

import { UpdateResourceDetailCommand } from './update-resource-detail.command';
import { UpdateResourceDetailHandler } from './update-resource-detail.handler';

describe('UpdateResourceDetailHandler', () => {
  let resourceRepo: {
    findOne: ReturnType<typeof vi.fn>
  };
  let handler: UpdateResourceDetailHandler;

  beforeEach(() => {
    resourceRepo = {
      findOne: vi.fn(),
    };

    handler = new UpdateResourceDetailHandler(
      resourceRepo as unknown as ResourceRepository,
    );
  });

  it('updates platform resource details successfully', async () => {
    const resource = {
      id: 'res-1',
      code: 'OLD_CODE',
      name: 'Old Name',
      scope: ResourceScope.PLATFORM,
      path: '/old',
      icon: 'LayoutDashboard',
    } as unknown as Resource;

    resourceRepo.findOne
      .mockResolvedValueOnce(resource) // identifyResource
      .mockResolvedValueOnce(null); // validateNoDuplicateCode

    const result = await handler.execute(
      new UpdateResourceDetailCommand('res-1', 'NEW_CODE', 'New Name', ResourceScope.PLATFORM, '/new', 'NewIcon'),
    );

    expect(result).toEqual({ id: 'res-1' });
    expect(resource.code).toBe('NEW_CODE');
    expect(resource.name).toBe('New Name');
    expect(resource.path).toBe('/new');
    expect(resource.icon).toBe('NewIcon');
  });

  it('throws error when a duplicate platform resource code exists', async () => {
    const resource = {
      id: 'res-1',
      code: 'OLD_CODE',
      scope: ResourceScope.PLATFORM,
    } as unknown as Resource;

    const duplicateResource = {
      id: 'res-2',
      code: 'NEW_CODE',
    } as unknown as Resource;

    resourceRepo.findOne
      .mockResolvedValueOnce(resource) // identifyResource
      .mockResolvedValueOnce(duplicateResource); // validateNoDuplicateCode

    await expect(
      handler.execute(
        new UpdateResourceDetailCommand('res-1', 'NEW_CODE', 'New Name', ResourceScope.PLATFORM, '/new'),
      ),
    ).rejects.toThrow();
  });

  it('updates organization resource details successfully', async () => {
    const resource = {
      id: 'org-res-1',
      code: 'ORG_INFO',
      name: '조직 기본 정보',
      scope: ResourceScope.ORGANIZATION,
      path: '/info',
      icon: 'Info',
    } as unknown as Resource;

    resourceRepo.findOne.mockResolvedValueOnce(resource);
    resourceRepo.findOne.mockResolvedValueOnce(null);

    const result = await handler.execute(
      new UpdateResourceDetailCommand(
        'org-res-1',
        'ORG_INFO',
        '조직 기본 정보',
        ResourceScope.ORGANIZATION,
        '/organization-info',
        'NewIcon',
      ),
    );

    expect(result).toEqual({ id: 'org-res-1' });
    expect(resource.path).toBe('/organization-info');
    expect(resource.icon).toBe('NewIcon');
  });
});
