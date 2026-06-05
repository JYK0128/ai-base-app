import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResourceScope } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatePermissionSetCommand, UpdatePermissionSetPermissionsCommand, UpdateResourceSortCommand } from './commands';
import { GetPermissionSetsQuery } from './queries';
import { ResourceController } from './resource.controller';

describe('ResourceController', () => {
  let queryBus: {
    execute: ReturnType<typeof vi.fn>
  };
  let commandBus: {
    execute: ReturnType<typeof vi.fn>
  };
  let controller: ResourceController;

  beforeEach(() => {
    queryBus = {
      execute: vi.fn(),
    };
    commandBus = {
      execute: vi.fn(),
    };

    controller = new ResourceController(
      queryBus as unknown as QueryBus,
      commandBus as unknown as CommandBus,
    );
  });

  it('passes bulk sort items to the command bus', async () => {
    const items = [
      { id: 'res-1', sortOrder: 2 },
      { id: 'res-2', sortOrder: 1 },
    ];

    commandBus.execute.mockResolvedValueOnce({ success: true });

    const result = await controller.updateResourceSort({
      scope: ResourceScope.ORGANIZATION,
      items,
    }) as { success: boolean };

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute.mock.calls[0][0]).toBeInstanceOf(UpdateResourceSortCommand);
    expect(commandBus.execute.mock.calls[0][0]).toMatchObject({ items });
    expect(result).toEqual({ success: true });
  });

  it('passes resource scope to the query bus', async () => {
    queryBus.execute.mockResolvedValueOnce([{ id: 'res-1' }]);

    const result = await controller.getResources({
      permissions: [],
      scope: ResourceScope.ORGANIZATION,
      filterByPermissions: false,
    }) as Array<{ id: string }>;

    expect(queryBus.execute).toHaveBeenCalledTimes(1);
    expect(queryBus.execute.mock.calls[0][0]).toMatchObject({ scope: ResourceScope.ORGANIZATION });
    expect(result).toEqual([{ id: 'res-1' }]);
  });

  it('passes permission set list request to the query bus', async () => {
    queryBus.execute.mockResolvedValueOnce([]);

    const result = await controller.getPermissionSets({}) as [];

    expect(queryBus.execute).toHaveBeenCalledTimes(1);
    expect(queryBus.execute.mock.calls[0][0]).toBeInstanceOf(GetPermissionSetsQuery);
    expect(result).toEqual([]);
  });

  it('passes permission set creation to the command bus', async () => {
    commandBus.execute.mockResolvedValueOnce({ id: 'role-1' });

    const result = await controller.createPermissionSet({
      code: 'SYSTEM_OPERATOR',
      name: '시스템 운영 담당자',
      description: '운영 권한',
      copyFromId: 'role-copy',
    }) as { id: string };

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute.mock.calls[0][0]).toBeInstanceOf(CreatePermissionSetCommand);
    expect(commandBus.execute.mock.calls[0][0]).toMatchObject({
      code: 'SYSTEM_OPERATOR',
      name: '시스템 운영 담당자',
      description: '운영 권한',
      copyFromId: 'role-copy',
    });
    expect(result).toEqual({ id: 'role-1' });
  });

  it('passes permission set permission update to the command bus', async () => {
    commandBus.execute.mockResolvedValueOnce({ id: 'role-1' });

    const result = await controller.updatePermissionSetPermissions({
      id: 'role-1',
      permissionCodes: ['DASHBOARD:READ'],
    }) as { id: string };

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute.mock.calls[0][0]).toBeInstanceOf(UpdatePermissionSetPermissionsCommand);
    expect(commandBus.execute.mock.calls[0][0]).toMatchObject({ id: 'role-1', permissionCodes: ['DASHBOARD:READ'] });
    expect(result).toEqual({ id: 'role-1' });
  });
});
