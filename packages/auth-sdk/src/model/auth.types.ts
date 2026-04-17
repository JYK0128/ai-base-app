export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface AuthState {
  status: AuthStatus
  session: AuthSession | null
}
