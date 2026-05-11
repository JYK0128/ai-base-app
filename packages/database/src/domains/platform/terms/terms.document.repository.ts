import { EntityRepository } from '@mikro-orm/postgresql';

import { TermsDocument } from './terms.document.entity';

export class TermsDocumentRepository extends EntityRepository<TermsDocument> {}
