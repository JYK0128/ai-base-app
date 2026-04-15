import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import type { ApplicationSubscription } from '@/domains/application/application.subscription.entity';
import type { OrganizationBillingProfile } from '@/domains/billing/billing.entity';
import { Payment } from '@/domains/billing/billing.payment.entity';
import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
}

@Entity({ schema: 'billing' })
export class Order extends BaseEntity {
  @Index()
  @ManyToOne()
  organization!: Rel<Organization>;

  @Index()
  @ManyToOne()
  subscription!: Rel<ApplicationSubscription>;

  @Index()
  @ManyToOne()
  billingProfile!: Rel<OrganizationBillingProfile>;

  @Property()
  billingName!: string;

  @Property({ nullable: true })
  taxId?: string;

  @Property({ type: 'text' })
  billingAddress!: string;

  @Property({ length: 3, default: 'USD' })
  currency: string & Opt = 'USD';

  @Property({ type: 'decimal', precision: 14, scale: 2, default: '0.00' })
  taxAmount: string & Opt = '0.00';

  @Property({ type: 'decimal', precision: 14, scale: 2, default: '0.00' })
  totalAmount: string & Opt = '0.00';

  @Property({ nullable: true })
  providerTransactionId?: string;

  @Property({ nullable: true, unique: true })
  idempotencyKey?: string;

  @Enum(() => OrderStatus)
  status: OrderStatus & Opt = OrderStatus.PENDING;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments = new Collection<Payment>(this);
}
