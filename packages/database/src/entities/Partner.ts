import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/decorators/legacy';

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ schema: 'platform' })
export class Partner {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Enum(() => PartnerStatus)
  status: PartnerStatus = PartnerStatus.PENDING;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
