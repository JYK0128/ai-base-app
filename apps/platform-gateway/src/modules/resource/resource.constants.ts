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
    LIST: 'resources.get',
    CREATE: 'resources.create',
    UPDATE_DETAIL: 'resources.update-detail',
    UPDATE_PERMISSIONS: 'resources.update-permissions',
    UPDATE_SORT: 'resources.update-sort',
    DELETE: 'resources.delete',
  },
} as const;
