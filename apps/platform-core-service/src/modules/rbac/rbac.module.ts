import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Resource, Role, RolePermission } from '@pkg/database';

import { RbacHandlers } from './handlers';
import { RbacController } from './rbac.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Resource, Role, RolePermission]),
  ],
  controllers: [RbacController],
  providers: [...RbacHandlers],
})
export class RbacModule {}
