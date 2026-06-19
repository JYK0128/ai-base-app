import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';

import { ApproveOrganizationHandler } from './approve-organization/approve-organization.handler';
import { GetOrganizationPageHandler } from './get-organization-page/get-organization-page.handler';
import { GetOrganizationRolesHandler } from './get-organization-roles/get-organization-roles.handler';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization, OrganizationRole]),
  ],
  controllers: [OrganizationController],
  providers: [GetOrganizationPageHandler, GetOrganizationRolesHandler, ApproveOrganizationHandler],
})
export class OrganizationModule {}
