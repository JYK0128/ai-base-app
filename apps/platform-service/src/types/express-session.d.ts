import 'express-session';

declare module 'express-session' {
  interface SessionData {
    accountId?: string
  }
}

export {};
