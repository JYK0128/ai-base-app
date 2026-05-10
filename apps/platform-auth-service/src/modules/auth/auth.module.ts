import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { Manager, ManagerAccount, ManagerAccountVerification, ManagerRole, Organization, Permission, Role, RolePermission } from '@pkg/database';

import { ENV } from '@/common/env';

import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { Handlers } from './handlers';
import { MailerService } from './services/mailer.service';
import { VerificationTokenService } from './services/verification-token.service';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      ManagerAccount,
      ManagerAccountVerification,
      Manager,
      Organization,
      ManagerRole,
      Role,
      Permission,
      RolePermission,
    ]),
    JwtModule.register({
      secret: ENV.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN },
    }),
    RedisModule.forFeature({ namespace: 'auth' }),
  ],
  controllers: [AuthController],
  providers: [...Handlers, MailerService, VerificationTokenService],
})
export class AuthModule {}
