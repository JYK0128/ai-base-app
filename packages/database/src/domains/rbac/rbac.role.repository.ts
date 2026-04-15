import { CoreRepository } from '../core/core.repository';
import type { Role } from './rbac.entity';

export class RbacRoleRepository extends CoreRepository<Role> {}
