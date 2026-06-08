import '@mikro-orm/postgresql';

import type { Database } from './entities.generated';

declare module '@mikro-orm/postgresql' {
  interface EntityManager {
    '~entities'?: Database
  }
}
export {};
