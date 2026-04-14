/**
 * 식별자 키 생성을 위한 유틸리티 클래스
 */
export class KeyHelper {
  private static readonly DEFAULT_DELIMITER = '::';

  /**
   * 여러 개의 파트를 구분자(::)로 조합하여 복합 키를 생성합니다.
   * null이나 undefined는 빈 문자열로 취급합니다.
   */
  static join(...parts: (string | number | undefined | null)[]): string {
    return parts.map((p) => (p === null || p === undefined ? '' : String(p))).join(this.DEFAULT_DELIMITER);
  }

  /**
   * 키를 다시 파트로 분리합니다.
   */
  static split(key: string): string[] {
    return key.split(this.DEFAULT_DELIMITER);
  }
}
