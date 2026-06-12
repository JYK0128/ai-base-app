import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';

import { MembersController } from './members.controller';
import { GetMemberHandler } from './queries/get-member.handler';
import { GetMembersHandler } from './queries/get-members.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Member, Organization]),
  ],
  controllers: [MembersController],
  providers: [GetMemberHandler, GetMembersHandler],
})
export class MembersModule {}
