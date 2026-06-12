/**
 * 캐시 키 생성을 일관되게 관리하기 위한 유틸리티입니다.
 * 도메인:액션:식별자 구조를 생성합니다.
 */
export class AuthKeyBuilder {
  constructor(private readonly domain: string) {}

  static for(domain: string) {
    return new AuthKeyBuilder(domain);
  }

  build(action: string, value: string): string {
    return `${this.domain}:${action}:${value}`;
  }
}
