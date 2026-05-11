import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Organization } from '@pkg/database';

import { OrganizationHandlers } from './handlers';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Organization]),
  ],
  controllers: [OrganizationController],
  providers: [...OrganizationHandlers],
})
export class OrganizationModule {}
