import { CoreRepository } from '../core/core.repository';
import type { Permission } from './rbac.permission.entity';

export class RbacPermissionRepository extends CoreRepository<Permission> {}
