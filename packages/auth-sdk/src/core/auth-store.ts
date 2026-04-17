import type { AuthState } from '../model/auth.types';
import type { User } from '../model/user.types';

export interface AuthStore {
  auth: AuthState
  user: User | null
}

export const createInitialAuthStore = (): AuthStore => ({
  auth: {
    status: 'idle',
    session: null,
  },
  user: null,
});
