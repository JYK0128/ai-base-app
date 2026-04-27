import { SetMetadata } from '@nestjs/common';

export const BYPASS_KEY = 'security_bypass';

export const BYPASS_POLICIES = {
  PASSWORD: 'password',
  MFA: 'mfa',
  TERMS: 'terms',
} as const;

export type BypassPolicy = (typeof BYPASS_POLICIES)[keyof typeof BYPASS_POLICIES];

/**
 * 특정 보안 정책이나 계정 제한 사항을 우회(Bypass)합니다.
 * @param policies 우회할 정책 목록 (BYPASS_POLICIES 참고)
 *
 * @example @Bypass(BYPASS_POLICIES.PASSWORD)
 */
export const Bypass = (...policies: BypassPolicy[]) => SetMetadata(BYPASS_KEY, policies);
