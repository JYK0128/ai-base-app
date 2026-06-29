import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Member, MemberInvite, Organization, OrganizationRole } from '@pkg/database';

import { ENV } from '@/env';

import { CreateInviteHandler } from './create-invite/create-invite.handler';
import { InviteEmailPublisher } from './create-invite/invite-email.publisher';
import { GetInviteListHandler } from './get-invite-list/get-invite-list.handler';
import { GetMemberHandler } from './get-member/get-member.handler';
import { GetMemberPageHandler } from './get-member-page/get-member-page.handler';
import { MembersController } from './member.controller';
import { UpdateMemberRoleHandler } from './update-member-role/update-member-role.handler';
import { UpdateMemberStatusHandler } from './update-member-status/update-member-status.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Member, MemberInvite, Organization, OrganizationRole]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: 'mail_queue',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            frameMax: 8192,
          },
        },
      },
    ]),
  ],
  controllers: [MembersController],
  providers: [GetMemberHandler, GetMemberPageHandler, GetInviteListHandler, CreateInviteHandler, UpdateMemberRoleHandler, UpdateMemberStatusHandler, InviteEmailPublisher],
})
export class MemberModule {}
