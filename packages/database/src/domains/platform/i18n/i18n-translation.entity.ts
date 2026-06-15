import { EntityName } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';

@Entity({ schema: 'platform' })
export class I18nTranslation extends CoreEntity<I18nTranslation> {
  [EntityName]?: 'I18nTranslation';

  @Property({ type: 'string' })
  namespace!: string;

  @Property({ type: 'string' })
  key!: string;

  @Property({ type: 'string' })
  localeCode!: string;

  @Property({ type: 'text' })
  value!: string;
}
