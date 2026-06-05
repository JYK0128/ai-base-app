import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationPermission, OrganizationRole, OrganizationRoleAssignment, Resource } from '@pkg/database';

import { ResourceHandlers } from './handlers';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      Organization,
      OrganizationPermission,
      OrganizationRole,
      OrganizationRoleAssignment,
      Resource,
    ]),
  ],
  controllers: [ResourceController],
  providers: [...ResourceHandlers],
})
export class ResourceModule {}
