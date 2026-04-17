import type { AuthClient } from '../core/auth-client';

export const createBffAuthAdapter = (client: AuthClient): AuthClient => client;
