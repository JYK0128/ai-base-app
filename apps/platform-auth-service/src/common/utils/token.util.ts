import * as jose from 'jose';

import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';

export class TokenUtil {
  private static getExpirationTime(secondsFromNow: number) {
    return Math.floor(Date.now() / 1000) + secondsFromNow;
  }

  /**
   * Access Token과 Refresh Token 쌍을 생성합니다.
   */
  static async generateTokens(
    payload: JWTPayload,
  ) {
    const encoder = new TextEncoder();
    const accessPayload: JWTPayload = {
      ...payload,
      typ: 'access',
    };
    const refreshPayload: JWTPayload = {
      sub: payload.sub,
      organizationId: payload.organizationId,
      typ: 'refresh',
    };

    // Access Token 생성
    const accessToken = await new jose.SignJWT(accessPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.getExpirationTime(ENV.JWT_ACCESS_EXPIRES_IN))
      .sign(encoder.encode(ENV.JWT_ACCESS_SECRET));

    // Refresh Token 생성
    const refreshToken = await new jose.SignJWT(refreshPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.getExpirationTime(ENV.JWT_REFRESH_EXPIRES_IN))
      .sign(encoder.encode(ENV.JWT_REFRESH_SECRET));

    return { accessToken, refreshToken };
  }
}
