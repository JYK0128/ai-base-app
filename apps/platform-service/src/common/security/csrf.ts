import { doubleCsrf } from 'csrf-csrf';

import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

const CSRF_HEADER_NAME = 'x-csrf-token';

const csrfUtilities = doubleCsrf({
  getSecret: () => ENV.SESSION_SECRET,
  getSessionIdentifier: (req) => req.sessionID,
  cookieName: ENV.CSRF_COOKIE_NAME,
  cookieOptions: createCookieOptions(),
  getCsrfTokenFromRequest: (req) => {
    const token = req.headers[CSRF_HEADER_NAME];
    return typeof token === 'string' ? token : undefined;
  },
});

export const { generateCsrfToken, doubleCsrfProtection, validateRequest } = csrfUtilities;
