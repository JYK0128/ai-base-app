import type { EntityManager } from '@mikro-orm/core';

import { RbacAssignmentRepository } from '@/domains/rbac/rbac.assignment.repository';
import { type CreatePermissionInput,
         type PermissionRecord,
         RbacPermissionRepository,
         type UpdatePermissionInput } from '@/domains/rbac/rbac.permission.repository';
import { type CreateRoleInput,
         RbacRoleRepository,
         type RoleRecord,
         type UpdateRoleInput } from '@/domains/rbac/rbac.role.repository';

export class RbacRepository {
  private readonly roleRepo: RbacRoleRepository;
  private readonly permissionRepo: RbacPermissionRepository;
  private readonly assignmentRepo: RbacAssignmentRepository;

  constructor(private readonly em: EntityManager) {
    this.roleRepo = new RbacRoleRepository(em);
    this.permissionRepo = new RbacPermissionRepository(em);
    this.assignmentRepo = new RbacAssignmentRepository(em);
  }

  async listRoles(): Promise<RoleRecord[]> {
    return this.roleRepo.listRoles();
  }

  async listPermissions(): Promise<PermissionRecord[]> {
    return this.permissionRepo.listPermissions();
  }

  async createRole(input: CreateRoleInput): Promise<RoleRecord> {
    return this.roleRepo.createRole(input);
  }

  async updateRole(input: UpdateRoleInput): Promise<RoleRecord> {
    return this.roleRepo.updateRole(input);
  }

  async deleteRole(params: { id: string, actorId?: string }): Promise<void> {
    return this.roleRepo.deleteRole(params);
  }

  async createPermission(input: CreatePermissionInput): Promise<PermissionRecord> {
    return this.permissionRepo.createPermission(input);
  }

  async updatePermission(input: UpdatePermissionInput): Promise<PermissionRecord> {
    return this.permissionRepo.updatePermission(input);
  }

  async deletePermission(params: { id: string, actorId?: string }): Promise<void> {
    return this.permissionRepo.deletePermission(params);
  }

  async assignPermissionToRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    return this.roleRepo.assignPermissionToRole(params);
  }

  async revokePermissionFromRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    return this.roleRepo.revokePermissionFromRole(params);
  }

  async assignRoleToManager(params: { managerId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    return this.assignmentRepo.assignRoleToManager(params);
  }

  async revokeRoleFromManager(params: { managerId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    return this.assignmentRepo.revokeRoleFromManager(params);
  }

  async getPermissionCodesByManager(params: { managerId: string, organizationId?: string }): Promise<string[]> {
    return this.assignmentRepo.getPermissionCodesByManager(params);
  }
}

export const createRbacRepository = (em: EntityManager): RbacRepository => (
  new RbacRepository(em)
);

export { createRbacAssignmentRepository,
  RbacAssignmentRepository } from '@/domains/rbac/rbac.assignment.repository';
export { createRbacPermissionRepository,
  RbacPermissionRepository } from '@/domains/rbac/rbac.permission.repository';
export { createRbacRoleRepository,
  RbacRoleRepository } from '@/domains/rbac/rbac.role.repository';
