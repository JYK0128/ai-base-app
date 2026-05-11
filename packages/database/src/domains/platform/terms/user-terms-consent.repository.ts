import { EntityRepository } from '@mikro-orm/postgresql';

import { UserTermsConsent } from './user-terms-consent.entity';

export class UserTermsConsentRepository extends EntityRepository<UserTermsConsent> {}
