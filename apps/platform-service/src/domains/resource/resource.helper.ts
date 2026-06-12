import type { OrganizationRole, Resource, ResourceScope } from '@pkg/database';

import { PermissionSetResponseDto } from './permission-sets/get-permission-sets.response.dto';
import { ResourceDetailResponseDto } from './queries/get-resource.response.dto';
import { ResourceResponseDto } from './queries/get-resources.response.dto';

interface ResourceNodeSource {
  id: string
  code: string
  name: string
  type: string
  scope: ResourceScope
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  constraint?: string
  parentId?: string
}

export function buildResourceDetailResponse(resource: Resource): ResourceDetailResponseDto {
  return new ResourceDetailResponseDto(resource);
}

export function buildResourceTreeResponse(resources: Resource[]): ResourceResponseDto[] {
  const sources = resources.map((resource) => ({
    id: resource.id,
    code: resource.code,
    name: resource.name,
    type: resource.type,
    scope: resource.scope,
    path: resource.path,
    icon: resource.icon,
    sortOrder: resource.sortOrder,
    actions: resource.actions,
    constraint: resource.constraint,
    parentId: resource.parent?.id,
  }));

  return buildResourceTreeFromSources(sources);
}

function buildResourceTreeFromSources(resources: ResourceNodeSource[]): ResourceResponseDto[] {
  const map = new Map<string, ResourceResponseDto>();

  for (const resource of resources) {
    map.set(resource.id, new ResourceResponseDto(resource));
  }

  const roots: ResourceResponseDto[] = [];

  for (const resource of resources) {
    const node = map.get(resource.id);
    if (!node) continue;

    if (resource.parentId) {
      const parentNode = map.get(resource.parentId);
      if (parentNode) {
        parentNode.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  sortResourceNodes(roots);
  return roots;
}

function sortResourceNodes(nodes: ResourceResponseDto[]) {
  nodes.sort((left, right) => {
    if (left.sortOrder === undefined && right.sortOrder === undefined) {
      return left.code.localeCompare(right.code);
    }
    if (left.sortOrder === undefined) {
      return 1;
    }
    if (right.sortOrder === undefined) {
      return -1;
    }

    const orderDiff = left.sortOrder - right.sortOrder;
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return left.code.localeCompare(right.code);
  });

  for (const node of nodes) {
    if (node.children.length > 0) {
      sortResourceNodes(node.children);
    }
  }
}

export function buildPermissionSetResponse(role: OrganizationRole): PermissionSetResponseDto {
  return new PermissionSetResponseDto(role);
}
