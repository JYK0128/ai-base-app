import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole, Resource } from '@pkg/database';

import { GetResourceHandler } from './get-resource/get-resource.handler';
import { GetResourceListHandler } from './get-resource-list/get-resource-list.handler';
import { GetRolePermissionListHandler } from './get-role-permission-list/get-role-permission-list.handler';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole, Resource]),
  ],
  controllers: [ResourceController],
  providers: [GetResourceHandler, GetResourceListHandler, GetRolePermissionListHandler],
})
export class ResourceModule {}
