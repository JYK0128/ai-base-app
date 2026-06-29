import { Injectable, NestMiddleware } from '@nestjs/common';
import { RedisStore } from 'connect-redis';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import session from 'express-session';

import { SessionClientService } from '@/common/services/session-client.service';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly middleware: RequestHandler;

  constructor(
    private readonly sessionClientService: SessionClientService,
  ) {
    this.middleware = session({
      name: ENV.SESSION_COOKIE_NAME,
      store: new RedisStore({
        client: this.sessionClientService.client,
        prefix: 'sess:',
        ttl: ENV.SESSION_EXPIRES_IN,
      }),
      secret: ENV.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: createCookieOptions(),
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.middleware(req, res, next);
  }
}
