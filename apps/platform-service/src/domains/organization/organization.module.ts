import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';

import { ApproveOrganizationHandler } from './approve-organization/approve-organization.handler';
import { CreateOrganizationRoleHandler } from './create-organization-role/create-organization-role.handler';
import { DeleteOrganizationRoleHandler } from './delete-organization-role/delete-organization-role.handler';
import { GetOrganizationListHandler } from './get-organization-list/get-organization-list.handler';
import { OrganizationController } from './organization.controller';
import { GetOrganizationRoleListHandler } from './organization-role-list/get-organization-role-list.handler';
import { UpdateOrganizationHandler } from './update-organization/update-organization.handler';
import { UpdateOrganizationRoleHandler } from './update-organization-role/update-organization-role.handler';
import { UpdateOrganizationRoleSortHandler } from './update-organization-role-sort/update-organization-role-sort.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole]),
  ],
  controllers: [OrganizationController],
  providers: [
    GetOrganizationListHandler,
    GetOrganizationRoleListHandler,
    CreateOrganizationRoleHandler,
    UpdateOrganizationRoleHandler,
    DeleteOrganizationRoleHandler,
    UpdateOrganizationRoleSortHandler,
    ApproveOrganizationHandler,
    UpdateOrganizationHandler,
  ],
})
export class OrganizationModule {}
