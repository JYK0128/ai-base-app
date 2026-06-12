import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Member, MemberInvite, Organization, OrganizationRole } from '@pkg/database';

import { CreateInviteHandler } from './commands/create-invite.handler';
import { UpdateMemberRoleHandler } from './commands/update-member-role.handler';
import { UpdateMemberStatusHandler } from './commands/update-member-status.handler';
import { InviteEmailPublisher } from './events/invite-email.publisher';
import { MembersController } from './members.controller';
import { GetMemberHandler } from './queries/get-member.handler';
import { GetMembersHandler } from './queries/get-members.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Member, MemberInvite, Organization, OrganizationRole]),
  ],
  controllers: [MembersController],
  providers: [GetMemberHandler, GetMembersHandler, CreateInviteHandler, UpdateMemberRoleHandler, UpdateMemberStatusHandler, InviteEmailPublisher],
})
export class MembersModule {}
