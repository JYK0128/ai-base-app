import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';

import { UpdateOrganizationApprovalHandler } from './commands/approve-organization.handler';
import { OrganizationController } from './organization.controller';
import { GetOrganizationRolesHandler } from './queries/get-organization-roles.handler';
import { GetOrganizationsHandler } from './queries/get-organizations.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole]),
  ],
  controllers: [OrganizationController],
  providers: [GetOrganizationsHandler, GetOrganizationRolesHandler, UpdateOrganizationApprovalHandler],
})
export class OrganizationModule {}
