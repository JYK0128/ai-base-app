import type { AuthSession } from '../model/auth.types';
import type { User } from '../model/user.types';

export interface AuthClient {
  signIn: (username: string, password: string) => Promise<{ session: AuthSession, user: User }>
  signOut: () => Promise<void>
  refresh: () => Promise<AuthSession | null>
  getCurrentUser: () => Promise<User | null>
}
