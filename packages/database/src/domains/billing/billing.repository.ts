import type { EntityManager } from '@mikro-orm/core';

import { OrganizationBillingProfile } from '@/domains/billing/billing.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class OrganizationBillingProfileRepository extends BaseRepository<OrganizationBillingProfile> {
  constructor(em: EntityManager) {
    super(em, OrganizationBillingProfile);
  }
}

export const createOrganizationBillingProfileRepository = (
  em: EntityManager,
): OrganizationBillingProfileRepository => new OrganizationBillingProfileRepository(em);

export { createOrderRepository,
  OrderRepository } from '@/domains/billing/billing.order.repository';
export { createPaymentRepository,
  PaymentRepository } from '@/domains/billing/billing.payment.repository';
