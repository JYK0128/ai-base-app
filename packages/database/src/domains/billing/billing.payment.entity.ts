import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Order } from './billing.order.entity';
import { PaymentRepository } from './billing.payment.repository';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity({ schema: 'billing', repository: () => PaymentRepository })
export class Payment extends CoreEntity<Payment> {
  @Index()
  @ManyToOne()
  order!: Rel<Order>;

  @Property({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Property({ length: 3, default: 'USD' })
  currency: string & Opt = 'USD';

  @Property({ nullable: true })
  providerTransactionId?: string;

  @Property({ unique: true })
  idempotencyKey!: string;

  @Enum(() => PaymentStatus)
  status: PaymentStatus & Opt = PaymentStatus.PENDING;

  @Property({ nullable: true })
  paidAt?: Date;
}
