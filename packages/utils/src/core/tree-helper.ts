/**
 * 임의의 객체 트리 구조를 나타내는 재귀적 타입
 */
export type TreeStructure<V> = {
  [key: string]: V | TreeStructure<V> | null | undefined
};

/**
 * 계층형 객체(Tree) 구조를 다루기 위한 유틸리티 클래스
 */
export class TreeHelper {
  /**
   * 객체를 깊은 복사합니다.
   */
  static clone<T>(obj: T): T {
    if (this.isNullish(obj)) return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 두 트리 구조를 깊은 병합합니다.
   */
  static merge<V>(target: TreeStructure<V>, source: TreeStructure<V>): TreeStructure<V> {
    const output: TreeStructure<V> = { ...target };

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (this.isObject(sourceValue)) {
        if (!(key in target) || !this.isObject(targetValue)) {
          output[key] = sourceValue;
        }
        else {
          output[key] = this.merge(targetValue, sourceValue);
        }
      }
      else {
        output[key] = sourceValue;
      }
    });

    return output;
  }

  /**
   * 도트(.) 표기법 키를 사용하여 트리에서 값을 가져옵니다.
   */
  static get<V>(tree: TreeStructure<V> | null | undefined, key: string): V | null | undefined {
    const parts = key.split('.');
    let current: V | TreeStructure<V> | null | undefined = tree;

    for (const part of parts) {
      if (this.isNullish(current) || !this.isObject(current)) {
        return undefined;
      }
      current = current[part];
    }

    return current as V | null | undefined;
  }

  /**
   * 평탄화된 { key, value } 배열을 트리 구조로 복원합니다.
   */
  static unflatten<V>(records: { key: string, value: V | null | undefined }[]): TreeStructure<V> {
    const result: TreeStructure<V> = {};

    for (const record of records) {
      const parts = record.key.split('.');
      let current = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = record.value;
        }
        else {
          if (!current[part] || !this.isObject(current[part])) {
            current[part] = {};
          }
          current = current[part] as TreeStructure<V>;
        }
      }
    }

    return result;
  }

  /**
   * 트리 구조를 { key, value } 형태의 평탄화된 배열로 변환합니다.
   */
  static flatten<V>(tree: TreeStructure<V>, prefix = ''): { key: string, value: V | null | undefined }[] {
    let result: { key: string, value: V | null | undefined }[] = [];

    for (const key in tree) {
      if (Object.prototype.hasOwnProperty.call(tree, key)) {
        const value = tree[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (this.isObject(value)) {
          result = result.concat(this.flatten(value, fullKey));
        }
        else {
          result.push({ key: fullKey, value: value });
        }
      }
    }

    return result;
  }

  /**
   * 트리 구조(객체)인지 확인하는 타입 가드
   */
  private static isObject<V>(item: unknown): item is TreeStructure<V> {
    return (
      item !== null
      && typeof item === 'object'
      && !Array.isArray(item)
      && !(item instanceof Date)
      && !(item instanceof RegExp)
    );
  }

  /**
   * 값이 비어있는지(null 또는 undefined) 확인하는 타입 가드
   */
  private static isNullish(val: unknown): val is null | undefined {
    return val === null || val === undefined;
  }
}
