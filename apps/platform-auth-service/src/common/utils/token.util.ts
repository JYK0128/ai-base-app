import { JwtService } from '@nestjs/jwt';

import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';

export class TokenUtil {
  /**
   * Access Token과 Refresh Token 쌍을 생성합니다.
   */
  static async generateTokens(
    jwtService: JwtService,
    sub: string,
    payload: Omit<JWTPayload, 'sub'>,
  ) {
    const jwtPayload: JWTPayload = {
      sub,
      ...payload,
    };

    const [accessToken, refreshToken] = await Promise.all([
      jwtService.signAsync(jwtPayload, {
        secret: ENV.JWT_ACCESS_SECRET,
        expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
      }),
      jwtService.signAsync(jwtPayload, {
        secret: ENV.JWT_REFRESH_SECRET,
        expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
