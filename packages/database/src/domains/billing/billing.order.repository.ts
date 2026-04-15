import { CoreRepository } from '../core/core.repository';
import type { Order } from './billing.order.entity';

export class OrderRepository extends CoreRepository<Order> {}
