import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResourceScope } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { type ResourceResponseDto, UpdatePermissionSetPermissionsDto } from './dto/resource.dto';
import { RESOURCE_SERVICE, RESOURCE_SERVICE_PATTERNS } from './resource.constants';

@Injectable()
export class ResourceClient extends CoreClient {
  constructor(
    @Inject(RESOURCE_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getResources(scope: ResourceScope): Promise<ResourceResponseDto[]> {
    return this.send<ResourceResponseDto[]>(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST, {
      scope,
      permissions: [],
      filterByPermissions: false,
      organizationId: this.cls.get('organizationId'),
    });
  }

  async getResource(id: string) {
    return this.send(RESOURCE_SERVICE_PATTERNS.RESOURCE.GET, { id });
  }

  async getMyResources(permissions: string[]): Promise<ResourceResponseDto[]> {
    return this.send<ResourceResponseDto[]>(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST, {
      scope: ResourceScope.ORGANIZATION,
      permissions,
      filterByPermissions: true,
      organizationId: this.cls.get('organizationId'),
    });
  }

  async getPermissionSets() {
    return this.send(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.LIST, {
      organizationId: this.cls.get('organizationId'),
    });
  }

  async createResource(data: {
    code: string
    name: string
    type: string
    path?: string
    parentId?: string
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.CREATE, data);
  }

  async updateResourceDetail(data: {
    id: string
    scope: ResourceScope
    code: string
    name: string
    path?: string
    icon?: string
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_DETAIL, data);
  }

  async deleteResource(id: string) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.DELETE, { id });
  }

  async updateResourcePermissions(data: {
    id: string
    scope: ResourceScope
    actions: string[]
    constraint?: string
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_PERMISSIONS, data);
  }

  async updateResourceSort(data: {
    scope: ResourceScope
    items: Array<{ id: string, sortOrder: number }>
  }) {
    return this.send<{ success: boolean }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_SORT, data);
  }

  async createPermissionSet(data: {
    code: string
    name: string
    description?: string
    copyFromId?: string
  }) {
    return this.send(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.CREATE, {
      ...data,
      organizationId: this.cls.get('organizationId'),
    });
  }

  async updatePermissionSetPermissions(data: UpdatePermissionSetPermissionsDto) {
    return this.send(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.UPDATE_PERMISSIONS, {
      ...data,
      organizationId: this.cls.get('organizationId'),
    });
  }
}
