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
