import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { BillingOrder } from './billing.order.entity';
import { BillingPaymentRepository } from './billing.payment.repository';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity({ schema: 'billing', repository: () => BillingPaymentRepository })
export class BillingPayment extends CoreEntity<BillingPayment> {
  @Index()
  @ManyToOne()
  order!: Rel<BillingOrder>;

  @Property({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Property({ length: 3, default: 'USD' })
  currency: Opt<string> = 'USD';

  @Property({ nullable: true })
  providerTransactionId?: string;

  @Property({ unique: true })
  idempotencyKey!: string;

  @Enum(() => PaymentStatus)
  status: Opt<PaymentStatus> = PaymentStatus.PENDING;

  @Property({ nullable: true })
  paidAt?: Date;
}
