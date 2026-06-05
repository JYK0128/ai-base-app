import { EntityRepository } from '@mikro-orm/postgresql';

import { TermsConsent } from './terms.consent.entity';

export class TermsConsentRepository extends EntityRepository<TermsConsent> {}
