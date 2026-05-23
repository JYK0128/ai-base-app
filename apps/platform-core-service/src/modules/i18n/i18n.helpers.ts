/**
 * 도트(.) 표기법의 rawKey 문자열을 네임스페이스(namespace)와 상세 키(key) 객체로 파싱합니다.
 * @example parseKey("common.buttons.save") // { namespace: "common", key: "buttons.save" }
 */
export function parseKey(rawKey: string): { namespace: string, key: string } {
  const [namespace, ...rest] = rawKey.split('.');
  const key = rest.join('.');
  return {
    namespace,
    key,
  };
}
