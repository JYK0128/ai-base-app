import { decodeJwt, type JWTHeaderParameters, type JWTPayload, jwtVerify, type JWTVerifyOptions, SignJWT } from 'jose';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';

type JwtTimeLike = string | number | Date;

interface JwtPairOptions {
  access: {
    secret: string
    expires: JwtTimeLike
  }
  refresh: {
    secret: string
    expires: JwtTimeLike
  }
}

/**
 * JWT 발행과 검증을 담당하는 공용 유틸 클래스입니다.
 */
export class JwtUtil {
  /**
   * 서명 검증 없이 JWT payload를 디코딩합니다.
   */
  static decode(token: string): JWTPayload {
    return decodeJwt(token);
  }

  /**
   * 지정한 payload를 HS256 JWT로 서명합니다.
   */
  static async issue(
    payload: JWTPayload,
    secret: string,
    expiresIn: JwtTimeLike,
    header?: Partial<JWTHeaderParameters>,
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', ...header })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(JwtUtil.encodeSecret(secret));
  }

  /**
   * JWT를 검증하고 payload를 반환합니다.
   */
  static async verify<TPayload extends JWTPayload>(
    token: string,
    secret: string,
    options?: JWTVerifyOptions,
  ): Promise<TPayload> {
    const { payload } = await jwtVerify(token, JwtUtil.encodeSecret(secret), {
      algorithms: ['HS256'],
      ...options,
    });

    return payload as TPayload;
  }

  /**
   * access payload를 기준으로 access/refresh 토큰 쌍을 생성합니다.
   */
  static async issuePair(
    payload: JWTPayload,
    options: JwtPairOptions,
  ): Promise<{ accessToken: string, refreshToken: string }> {
    if (!payload.sub) {
      throw new TypeError('JWT payload requires sub');
    }

    const cleanedPayload = omitBy(payload, isNil);

    const [accessToken, refreshToken] = await Promise.all([
      JwtUtil.issue(cleanedPayload, options.access.secret, options.access.expires),
      JwtUtil.issue({ sub: payload.sub }, options.refresh.secret, options.refresh.expires),
    ]);

    return { accessToken, refreshToken };
  }

  private static encodeSecret(secret: string): Uint8Array {
    return new TextEncoder().encode(secret);
  }
}
