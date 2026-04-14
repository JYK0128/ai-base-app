/**
 * 배열 및 컬렉션 처리를 위한 유틸리티 클래스
 */
export class CollectionHelper {
  /**
   * 객체 배열을 지정된 키 기준의 Map으로 변환합니다.
   */
  static toMap<T, K>(list: T[], keyGetter: (item: T) => K): Map<K, T> {
    return new Map(list.map((item) => [keyGetter(item), item]));
  }

  /**
   * 객체 배열을 특정 기준에 따라 그룹화합니다.
   */
  static groupBy<T, K>(list: T[], keyGetter: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of list) {
      const key = keyGetter(item);
      const group = map.get(key) ?? [];
      group.push(item);
      map.set(key, group);
    }
    return map;
  }
}
