import { EntityName, type Opt } from '@mikro-orm/core';
import { Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { I18nLocaleDirection } from './i18n-locale.constants';

@Entity({ schema: 'platform' })
export class I18nLocale extends CoreEntity<I18nLocale> {
  [EntityName]?: 'I18nLocale';

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', nullable: true })
  regionCode: string | null = null;

  @Enum(() => I18nLocaleDirection)
  direction: Opt<I18nLocaleDirection> = I18nLocaleDirection.LTR;

  @Property({ type: 'boolean' })
  isActive: Opt<boolean> = true;

  @Property({ type: 'boolean' })
  isDefault: Opt<boolean> = false;

  @Property({ type: 'number', nullable: true })
  sortOrder: number | null = null;
}
