import { Module } from '@nestjs/common';

import { SessionMiddleware } from '../middlewares/session.middleware';
import { SessionClientService } from '../services/session-client.service';

@Module({
  providers: [SessionClientService, SessionMiddleware],
  exports: [SessionClientService, SessionMiddleware],
})
export class SessionModule {}
