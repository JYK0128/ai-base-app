/**
 * 콤마로 구분된 key 목록 문자열을 파싱하고 공백이 제거된 문자열 배열로 변환합니다.
 * 배치 조회에서는 keys 자체를 key path로 취급하고, namespace는 별도 query param으로 받습니다.
 */
export function parseKeys(keys: string): string[] {
  const parsed = keys
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed;
}
