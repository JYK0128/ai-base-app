import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { CORE_SERVICE } from '../core/core.constants';
import { UpdateRolePermissionsDto } from './dto/rbac.dto';

@Injectable()
export class RbacClient {
  constructor(
    @Inject(CORE_SERVICE)
    private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  private async send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput): Promise<TResult> {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      sid: this.cls.get('sid'),
      clientIp: this.cls.get('clientIp'),
      id: this.cls.get('id'),
      organizationId: this.cls.get('organizationId'),
    };

    return firstValueFrom(
      this.client.send<TResult>(pattern, payload).pipe(
        defaultIfEmpty(undefined as TResult),
      ),
    );
  }

  async getResources() {
    return this.send('rbac.resources.get', {});
  }

  async getRoles() {
    return this.send('rbac.roles.get', {});
  }

  async getRolePermissionsMatrix() {
    return this.send<Record<string, string[]>>('rbac.role_permissions.matrix.get', {});
  }

  async getRoleResourcePermissionsMatrix() {
    return this.send<Record<string, Record<string, string[]>>>('rbac.role_permissions.resource_matrix.get', {});
  }

  async updateRolePermissions(roleCode: string, data: UpdateRolePermissionsDto) {
    return this.send('rbac.role_permissions.update', {
      roleCode,
      permissionCodes: data.permissionCodes,
    });
  }
}
