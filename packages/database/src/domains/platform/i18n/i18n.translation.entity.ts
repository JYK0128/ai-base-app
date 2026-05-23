import { Entity, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { I18nTranslationRepository } from './i18n.translation.repository';

@Entity({ schema: 'platform', repository: () => I18nTranslationRepository })
export class I18nTranslation extends CoreEntity<I18nTranslation> {
  @Property({ type: 'string' })
  namespace!: string;

  @Property({ type: 'string' })
  key!: string;

  @Property({ type: 'string' })
  localeCode!: string;

  @Property({ type: 'text' })
  value!: string;
}
