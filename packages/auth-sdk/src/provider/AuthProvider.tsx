import { type PropsWithChildren, useCallback, useMemo, useState } from 'react';

import type { AuthClient } from '../core/auth-client';
import { createInitialAuthStore } from '../core/auth-store';
import type { AuthContextValue } from './AuthContext';
import { AuthContext } from './AuthContext';

export interface AuthProviderProps extends PropsWithChildren {
  client: AuthClient
}

export function AuthProvider({ children, client }: Readonly<AuthProviderProps>) {
  const [store, setStore] = useState(createInitialAuthStore());

  const signIn = useCallback(async (username: string, password: string) => {
    setStore((prev) => ({ ...prev, auth: { ...prev.auth, status: 'loading' } }));

    const { session, user } = await client.signIn(username, password);

    setStore({
      auth: {
        status: 'authenticated',
        session,
      },
      user,
    });
  }, [client]);

  const signOut = useCallback(async () => {
    await client.signOut();

    setStore({
      auth: {
        status: 'unauthenticated',
        session: null,
      },
      user: null,
    });
  }, [client]);

  const value = useMemo<AuthContextValue>(() => ({
    client,
    auth: store.auth,
    user: store.user,
    isAuthenticated: store.auth.status === 'authenticated',
    signIn,
    signOut,
    hasRole: (role: string) => store.user?.roles.includes(role) ?? false,
    hasPermission: (permission: string) => store.user?.permissions.includes(permission) ?? false,
  }), [client, signIn, signOut, store.auth, store.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
