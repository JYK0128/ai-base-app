import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole, Resource } from '@pkg/database';

import { CreateResourceHandler } from './create-resource/create-resource.handler';
import { DeleteResourceHandler } from './delete-resource/delete-resource.handler';
import { GetPermissionMapListHandler } from './get-permission-map-list/get-permission-map-list.handler';
import { GetResourceHandler } from './get-resource/get-resource.handler';
import { GetResourceListHandler } from './get-resource-list/get-resource-list.handler';
import { GetRolePermissionListHandler } from './get-role-permission-list/get-role-permission-list.handler';
import { ResourceController } from './resource.controller';
import { UpdatePermissionSetPermissionsHandler } from './update-permission-set-permissions/update-permission-set-permissions.handler';
import { UpdateResourceHandler } from './update-resource/update-resource.handler';
import { UpdateResourceSortHandler } from './update-resource-sort/update-resource-sort.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole, Resource]),
  ],
  controllers: [ResourceController],
  providers: [
    CreateResourceHandler,
    DeleteResourceHandler,
    GetResourceHandler,
    GetResourceListHandler,
    GetPermissionMapListHandler,
    GetRolePermissionListHandler,
    UpdatePermissionSetPermissionsHandler,
    UpdateResourceHandler,
    UpdateResourceSortHandler,
  ],
})
export class ResourceModule {}
