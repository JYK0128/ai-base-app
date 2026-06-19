import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole, Resource } from '@pkg/database';

import { GetPermissionSetsHandler } from './get-permission-sets/get-permission-sets.handler';
import { GetResourceHandler } from './get-resource/get-resource.handler';
import { GetResourcePageHandler } from './get-resource-page/get-resource-page.handler';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole, Resource]),
  ],
  controllers: [ResourceController],
  providers: [GetResourceHandler, GetResourcePageHandler, GetPermissionSetsHandler],
})
export class ResourceModule {}
