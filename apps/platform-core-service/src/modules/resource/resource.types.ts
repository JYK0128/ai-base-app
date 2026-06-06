import type { OrganizationRole, Resource, ResourceScope, ResourceType } from '@pkg/database';

export type GetResourceInput = Pick<Resource, 'id'>;

export type GetResourcesInput = {
  permissions: string[]
  scope: ResourceScope
  filterByPermissions: boolean
};

export type CreateResourceInput = {
  code: string
  name: string
  type: ResourceType
  path?: string
  parentId?: string
};

export type CreatePermissionSetInput = {
  code: string
  name: string
  description?: string
  copyFromId?: string
};

export type UpdateResourceDetailInput = Pick<Resource, 'id'> & {
  code: string
  name: string
  scope: ResourceScope
  path?: string
  icon?: string
};

export type UpdateResourcePermissionsInput = Pick<Resource, 'id'> & {
  scope: ResourceScope
  actions: string[]
  constraint?: string
};

export type UpdatePermissionSetPermissionsInput = Pick<OrganizationRole, 'id'> & {
  permissionCodes: string[]
};

export type UpdateResourceSortInput = {
  scope: ResourceScope
  items: Array<{
    id: string
    sortOrder: number
  }>
};

export type DeleteResourceInput = Pick<Resource, 'id'>;
