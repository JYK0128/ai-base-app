import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole, Resource } from '@pkg/database';

import { GetPermissionSetsHandler } from './permission-sets/get-permission-sets.handler';
import { GetResourceHandler } from './queries/get-resource.handler';
import { GetResourcesHandler } from './queries/get-resources.handler';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole, Resource]),
  ],
  controllers: [ResourceController],
  providers: [GetResourceHandler, GetResourcesHandler, GetPermissionSetsHandler],
})
export class ResourceModule {}
