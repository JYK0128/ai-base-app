import * as jose from 'jose';

import { ENV } from '../env';
import type { JWTPayload } from '../types/request.type';

export class TokenUtil {
  /**
   * Access Token과 Refresh Token 쌍을 생성합니다.
   */
  static async generateTokens(
    payload: JWTPayload,
  ) {
    const encoder = new TextEncoder();

    // Access Token 생성
    const accessToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ENV.JWT_ACCESS_EXPIRES_IN)
      .sign(encoder.encode(ENV.JWT_ACCESS_SECRET));

    // Refresh Token 생성
    const refreshToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ENV.JWT_REFRESH_EXPIRES_IN)
      .sign(encoder.encode(ENV.JWT_REFRESH_SECRET));

    return { accessToken, refreshToken };
  }
}
