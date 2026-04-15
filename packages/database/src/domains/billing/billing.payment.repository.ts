import type { EntityManager } from '@mikro-orm/core';

import { Payment } from '@/domains/billing/billing.payment.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor(em: EntityManager) {
    super(em, Payment);
  }
}

export const createPaymentRepository = (
  em: EntityManager,
): PaymentRepository => new PaymentRepository(em);
