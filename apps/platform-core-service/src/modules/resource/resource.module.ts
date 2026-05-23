import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { ResourceHandlers } from './handlers';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Resource]),
  ],
  controllers: [ResourceController],
  providers: [...ResourceHandlers],
})
export class ResourceModule {}
