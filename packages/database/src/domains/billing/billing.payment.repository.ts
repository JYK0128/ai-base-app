import { CoreRepository } from '../core/core.repository';
import type { Payment } from './billing.payment.entity';

export class PaymentRepository extends CoreRepository<Payment> {}
