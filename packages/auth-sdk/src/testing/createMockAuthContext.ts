import type { AuthContextValue } from '../provider/AuthContext';

export const createMockAuthContext = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  client: {
    signIn: async () => ({ session: { accessToken: 'token' }, user: { id: '1', email: 'test@example.com', name: 'test', roles: [], permissions: [] } }),
    signOut: async () => undefined,
    refresh: async () => null,
    getCurrentUser: async () => null,
  },
  auth: {
    status: 'authenticated',
    session: { accessToken: 'token' },
  },
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    roles: [],
    permissions: [],
  },
  isAuthenticated: true,
  signIn: async () => undefined,
  signOut: async () => undefined,
  hasRole: () => false,
  hasPermission: () => false,
  ...overrides,
});
