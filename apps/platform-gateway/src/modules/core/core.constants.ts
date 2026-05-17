export const CORE_SERVICE = 'CORE_SERVICE';

export const CORE_SERVICE_PATTERNS = {
  ORGANIZATIONS: {
    GET: 'organizations.get',
    APPROVE: 'organizations.approve',
  },
  ANNOUNCEMENTS: {
    GET: 'announcements.get',
    CREATE: 'announcements.create',
  },
  SUPPORT: {
    TICKETS_GET: 'support.tickets.get',
  },
  TERMS: {
    GET_ACTIVE: 'terms.get.active',
    CREATE_DOCUMENT: 'terms.create.document',
    CREATE_VERSION: 'terms.create.version',
    AGREE: 'terms.agree',
  },
} as const;
