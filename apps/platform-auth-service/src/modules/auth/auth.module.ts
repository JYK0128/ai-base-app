import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthController } from './auth.controller';
import { Handlers } from './handlers';

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [...Handlers],
})
export class AuthModule {}
