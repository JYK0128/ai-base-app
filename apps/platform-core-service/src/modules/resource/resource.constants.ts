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
