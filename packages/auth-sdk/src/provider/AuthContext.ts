import { createContext } from 'react';

import type { AuthClient } from '../core/auth-client';
import type { AuthState } from '../model/auth.types';
import type { User } from '../model/user.types';

export interface AuthContextValue {
  client: AuthClient
  auth: AuthState
  user: User | null
  isAuthenticated: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null);
