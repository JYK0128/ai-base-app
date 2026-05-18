import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import axiosInstance from '../axios';

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  traceId: string
  requestId: string
}

export interface PermissionDto {
  id: string
  code: string
  name: string
  action: string
}

export interface ResourceTreeNode {
  id: string
  code: string
  name: string
  type: string
  path?: string
  icon?: string
  displayOrder?: number
  httpMethod?: string
  pathPattern?: string
  permissions: PermissionDto[]
  children: ResourceTreeNode[]
}

export interface RoleDto {
  id: string
  code: string
  name: string
  scope: string
  description?: string
}

/**
 * 🌟 자원 트리 구조 조회 Hook
 */
export const useGetRbacResources = () => {
  return useQuery<ResourceTreeNode[]>({
    queryKey: ['rbac.resources'],
    queryFn: async () => {
      const res = await axiosInstance<ApiResponse<ResourceTreeNode[]>>({
        url: '/api/v1/rbac/resources',
        method: 'GET',
      });
      return res.data;
    },
  });
};

/**
 * 🌟 역할 목록 조회 Hook
 */
export const useGetRbacRoles = () => {
  return useQuery<RoleDto[]>({
    queryKey: ['rbac.roles'],
    queryFn: async () => {
      const res = await axiosInstance<ApiResponse<RoleDto[]>>({
        url: '/api/v1/rbac/roles',
        method: 'GET',
      });
      return res.data;
    },
  });
};

/**
 * 🌟 역할별 매핑된 권한 목록 조회 Hook
 */
export const useGetRolePermissions = (roleCode: string, options?: { enabled?: boolean }) => {
  return useQuery<string[]>({
    queryKey: ['rbac.role_permissions', roleCode],
    queryFn: async () => {
      const res = await axiosInstance<ApiResponse<string[]>>({
        url: `/api/v1/rbac/roles/${roleCode}/permissions`,
        method: 'GET',
      });
      return res.data;
    },
    enabled: options?.enabled ?? !!roleCode,
  });
};

/**
 * 🌟 역할별 권한 매핑 업데이트 Mutation Hook
 */
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { roleCode: string, permissionCodes: string[] }>({
    mutationFn: async ({ roleCode, permissionCodes }) => {
      const res = await axiosInstance<ApiResponse<boolean>>({
        url: `/api/v1/rbac/roles/${roleCode}/permissions`,
        method: 'PUT',
        data: { permissionCodes },
      });
      return res.data;
    },
    onSuccess: (_, { roleCode }) => {
      // 역할별 권한 쿼리 캐시를 무효화하여 즉시 새로고침 반영
      queryClient.invalidateQueries({ queryKey: ['rbac.role_permissions', roleCode] });
    },
  });
};
