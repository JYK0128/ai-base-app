import { Entity, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

@Entity({ schema: 'tenant' })
export class TenantAccount extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;
}
