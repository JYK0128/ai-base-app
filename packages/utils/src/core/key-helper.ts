/**
 * 식별자 키 생성을 위한 유틸리티 클래스
 */
export class KeyHelper {
  private static readonly DEFAULT_DELIMITER = '::';
  private static readonly PERMISSION_DELIMITER = ':';

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

  /**
   * 권한 코드 파트들을 콜론(:)으로 조합하여 생성합니다.
   */
  static permission(...parts: (string | undefined | null)[]): string {
    return parts
      .filter((p) => p !== null && p !== undefined && p !== '')
      .join(this.PERMISSION_DELIMITER);
  }

  /**
   * 권한 코드를 파트별로 분리합니다. (scope:category:action)
   */
  static parsePermission(code: string) {
    const [scope, category, action] = code.split(this.PERMISSION_DELIMITER);
    return { scope, category, action };
  }
}
