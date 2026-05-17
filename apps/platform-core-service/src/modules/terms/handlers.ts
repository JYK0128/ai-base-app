import * as Commands from './commands';
import * as Queries from './queries';

/**
 * 모듈 내 'Handler'로 끝나는 클래스들만 필터링하여 반환합니다.
 */
const filterHandlers = (modules: Record<string, unknown>) =>
  Object.values(modules).filter(
    (val): val is { new (...args: unknown[]): unknown, name: string } =>
      typeof val === 'function'
      && 'name' in val
      && typeof val.name === 'string'
      && val.name.endsWith('Handler'),
  );

export const TermsHandlers = [
  ...filterHandlers(Commands),
  ...filterHandlers(Queries),
];
