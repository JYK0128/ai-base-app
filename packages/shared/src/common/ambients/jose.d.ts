import 'jose';

declare module 'jose' {
  interface JWTPayload {
    accountId?: string
    memberId?: string
    mustChangePassword?: boolean
    organizationId?: string
    permissions?: string[]
  }
}

export {};
