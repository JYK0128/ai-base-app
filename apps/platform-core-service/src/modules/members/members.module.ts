import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Member,
         MemberAccount,
         MemberInvite,
         Organization,
         OrganizationRole,
         OrganizationRoleAssignment } from '@pkg/database';

import { MailModule } from '../mail/mail.module';
import { MembersHandlers } from './handlers';
import { MembersController } from './members.controller';

@Module({
  imports: [
    CqrsModule,
    MailModule,
    MikroOrmModule.forFeature([
      Organization,
      Member,
      MemberAccount,
      MemberInvite,
      OrganizationRole,
      OrganizationRoleAssignment,
    ]),
  ],
  controllers: [MembersController],
  providers: [...MembersHandlers],
})
export class MembersModule {}
