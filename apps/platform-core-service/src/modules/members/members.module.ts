import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Member,
         MemberAccount,
         MemberInvite,
         Organization,
         OrganizationRole,
         OrganizationRoleAssignment } from '@pkg/database';

import { ENV } from '../../env';
import { InviteEmailPublisher } from './events/invite-email.publisher';
import { MembersHandlers } from './handlers';
import { MembersController } from './members.controller';
import { INVITE_EMAIL_QUEUE } from './members.tokens';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: INVITE_EMAIL_QUEUE,
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
  providers: [...MembersHandlers, InviteEmailPublisher],
})
export class MembersModule {}
