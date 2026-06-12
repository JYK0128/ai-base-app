import 'nestjs-cls';

import type { ServerContext } from '../index';

declare module 'nestjs-cls' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClsStore extends ServerContext {}
}

export {};
