/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly [key: string]: string | undefined
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

import 'jose';

declare module 'jose' {
  interface JWTPayload {
    mustChangePassword?: boolean
    tenantId?: string
  }
}
