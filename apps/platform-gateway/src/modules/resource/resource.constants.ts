/**
 * resource 마이크로서비스 인젝션 토큰
 */
export const RESOURCE_SERVICE = 'RESOURCE_SERVICE';

/**
 * resource 마이크로서비스와의 통신을 위한 메시지 패턴 상수 정의
 */
export const RESOURCE_SERVICE_PATTERNS = {
  RESOURCE: {
    GET: 'resource.get',
    LIST: 'resource.list',
    CREATE: 'resource.create',
    UPDATE_DETAIL: 'resource.update-detail',
    UPDATE_PERMISSIONS: 'resource.update-permissions',
    UPDATE_SORT: 'resource.update-sort',
    DELETE: 'resource.delete',
  },
  PERMISSION_SET: {
    LIST: 'resource.permission-set.list',
    CREATE: 'resource.permission-set.create',
    UPDATE_PERMISSIONS: 'resource.permission-set.update-permissions',
  },
} as const;
