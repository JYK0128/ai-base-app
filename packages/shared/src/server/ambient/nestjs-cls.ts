import 'nestjs-cls';

import type { AuthContext } from '../index';

declare module 'nestjs-cls' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClsStore extends AuthContext {}
}

export {};
