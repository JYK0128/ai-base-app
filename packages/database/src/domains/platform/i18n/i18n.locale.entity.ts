import { Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { I18nLocaleRepository } from './i18n.locale.repository';

export enum I18nLocaleDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

@Entity({ schema: 'platform', repository: () => I18nLocaleRepository })
export class I18nLocale extends CoreEntity<I18nLocale, 'direction' | 'isActive' | 'isDefault' | 'sortOrder'> {
  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', nullable: true })
  regionCode?: string;

  @Enum(() => I18nLocaleDirection)
  direction: I18nLocaleDirection = I18nLocaleDirection.LTR;

  @Property({ type: 'boolean' })
  isActive = true;

  @Property({ type: 'boolean' })
  isDefault = false;

  @Property({ type: 'number', nullable: true })
  sortOrder?: number;
}
