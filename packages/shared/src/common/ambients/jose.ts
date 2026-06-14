import 'jose';

declare module 'jose' {
  interface JWTPayload {
    accountId?: string
    memberId?: string
    organizationId?: string
  }
}

export {};
