import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization } from '@pkg/database';

import { ApproveOrganizationHandler } from './commands/approve-organization.handler';
import { OrganizationController } from './organization.controller';
import { GetOrganizationsHandler } from './queries/get-organizations.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization]),
  ],
  controllers: [OrganizationController],
  providers: [GetOrganizationsHandler, ApproveOrganizationHandler],
})
export class OrganizationModule {}
