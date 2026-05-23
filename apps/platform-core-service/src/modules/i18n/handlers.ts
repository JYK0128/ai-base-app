import * as Commands from './commands';
import * as Events from './events';
import * as Queries from './queries';

const filterHandlers = (modules: Record<string, unknown>) =>
  Object.values(modules).filter(
    (val): val is { new (...args: unknown[]): unknown, name: string } =>
      typeof val === 'function'
      && 'name' in val
      && typeof val.name === 'string'
      && val.name.endsWith('Handler'),
  );

export const I18nHandlers = [
  ...filterHandlers(Commands),
  ...filterHandlers(Queries),
  ...filterHandlers(Events),
];
