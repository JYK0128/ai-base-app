import type { AuthClient } from '../core/auth-client';
import type { AuthSession } from '../model/auth.types';
import type { User } from '../model/user.types';

const mockUser: User = {
  id: 'mock-user',
  email: 'mock@example.com',
  name: 'Mock User',
  roles: ['user'],
  permissions: ['read:profile'],
};

const mockSession: AuthSession = {
  accessToken: 'mock-token',
  refreshToken: 'mock-refresh-token',
};

export const mockAuthAdapter: AuthClient = {
  async signIn() {
    return { session: mockSession, user: mockUser };
  },
  async signOut() {
    return;
  },
  async refresh() {
    return mockSession;
  },
  async getCurrentUser() {
    return mockUser;
  },
};
