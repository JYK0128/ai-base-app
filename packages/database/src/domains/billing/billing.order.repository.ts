import type { EntityManager } from '@mikro-orm/core';

import { Order } from '@/domains/billing/billing.order.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class OrderRepository extends BaseRepository<Order> {
  constructor(em: EntityManager) {
    super(em, Order);
  }
}

export const createOrderRepository = (
  em: EntityManager,
): OrderRepository => new OrderRepository(em);
