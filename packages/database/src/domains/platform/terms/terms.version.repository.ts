import { EntityRepository } from '@mikro-orm/postgresql';

import { TermsVersion } from './terms.version.entity';

export class TermsVersionRepository extends EntityRepository<TermsVersion> {}
