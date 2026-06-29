import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';

import { ApproveOrganizationHandler } from './approve-organization/approve-organization.handler';
import { GetOrganizationListHandler } from './get-organization-list/get-organization-list.handler';
import { OrganizationController } from './organization.controller';
import { GetOrganizationRoleListHandler } from './organization-role-list/get-organization-role-list.handler';
import { UpdateOrganizationHandler } from './update-organization/update-organization.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole]),
  ],
  controllers: [OrganizationController],
  providers: [GetOrganizationListHandler, GetOrganizationRoleListHandler, ApproveOrganizationHandler, UpdateOrganizationHandler],
})
export class OrganizationModule {}
