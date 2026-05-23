export const CORE_SERVICE = 'CORE_SERVICE';

export const CORE_SERVICE_PATTERNS = {
  ORGANIZATION: {
    LIST: 'organizations.get',
    APPROVE: 'organizations.approve',
  },
  ANNOUNCEMENT: {
    LIST: 'announcements.get',
    CREATE: 'announcements.create',
  },
  SUPPORT: {
    TICKET_LIST: 'support.tickets.get',
  },
  TERM: {
    ACTIVE: 'terms.get.active',
    CREATE_DOCUMENT: 'terms.create.document',
    CREATE_VERSION: 'terms.create.version',
    AGREE: 'terms.agree',
  },
} as const;
