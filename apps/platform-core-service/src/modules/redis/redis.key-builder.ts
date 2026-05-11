/**
 * Redis 키 생성을 일관되게 관리하기 위한 유틸리티입니다.
 * 도메인:액션:식별자 구조를 생성합니다.
 */
export class RedisKeyBuilder {
  constructor(private readonly domain: string) {}

  /**
   * 도메인 전용 키 빌더를 생성합니다.
   * @param domain 도메인명 (예: login)
   */
  static for(domain: string) {
    return new RedisKeyBuilder(domain);
  }

  /**
   * 액션과 값을 조합하여 키를 생성합니다.
   * @param action 행위 (예: lock, attempt)
   * @param value 식별값 (예: email, id)
   */
  build(action: string, value: string): string {
    return `${this.domain}:${action}:${value}`;
  }
}
