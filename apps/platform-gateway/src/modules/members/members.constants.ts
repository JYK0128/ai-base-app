export const MEMBERS_SERVICE = 'MEMBERS_SERVICE';

export const MEMBERS_SERVICE_PATTERNS = {
  MEMBER: {
    LIST: 'members.get',
    GET: 'members.detail',
    UPDATE_ROLE: 'members.update-role',
    TOGGLE_STATUS: 'members.toggle-status',
  },
  INVITE: {
    LIST: 'members.invites.get',
    CREATE: 'members.invites.create',
    RESEND: 'members.invites.resend',
    CANCEL: 'members.invites.cancel',
    REVIVE: 'members.invites.revive',
  },
} as const;
