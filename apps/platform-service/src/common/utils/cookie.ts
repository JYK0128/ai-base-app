import type { CookieOptions } from 'express';

import { ENV } from '@/env';

// csrf 토큰
// origin, referrer 검사

/**
 * 앱 전반에서 쓰는 기본 쿠키 정책을 통일한다.
 * - JS 접근을 막는 `httpOnly`
 * - CSRF 완화용 `sameSite: 'lax'`
 * - 전체 경로 사용을 위한 `path: '/'`
 * - 운영 환경에서만 HTTPS 전송을 강제하는 `secure`
 * - `maxAge`/`expires`가 없으면 기본적으로 세션 쿠키
 */
export function createCookieOptions(
  options?: CookieOptions,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: ENV.NODE_ENV === 'production',
    ...options,
  };
}
