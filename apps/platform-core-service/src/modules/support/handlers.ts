import * as Commands from './commands';
import * as Events from './events';
import * as Queries from './queries';

/**
 * Filter and return only classes ending with 'Handler' from a module.
 */
const filterHandlers = (modules: Record<string, unknown>) =>
  Object.values(modules).filter(
    (val): val is { new (...args: unknown[]): unknown, name: string } =>
      typeof val === 'function'
      && 'name' in val
      && typeof val.name === 'string'
      && val.name.endsWith('Handler'),
  );

export const SupportHandlers = [
  ...filterHandlers(Commands),
  ...filterHandlers(Queries),
  ...filterHandlers(Events),
];
