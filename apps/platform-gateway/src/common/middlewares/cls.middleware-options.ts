import { randomUUID } from 'node:crypto';

import { Request } from 'express';
import type { ClsService, ClsStore } from 'nestjs-cls';

export function createClsMiddlewareOptions() {
  return {
    mount: false,
    setup: (cls: ClsService<ClsStore>, req: Request) => {
      const context: ClsStore = {
        traceId: String(req.headers['x-trace-id'] || randomUUID()),
        requestId: randomUUID(),
        sessionId: String(req.cookies.sessionId || ''),
        tenantId: String(req.headers['x-tenant-id'] || ''),
        ip: req.ip || '',
        realIp: String(req.headers['x-real-ip'] || req.ip || ''),
        userAgent: String(req.headers['user-agent'] || ''),
        referer: String(req.headers['referer'] || ''),
        method: req.method,
        url: req.url,
        startTime: Date.now(),
        acceptLanguage: String(req.headers['accept-language'] || ''),
      };

      Object.entries(context).forEach(([key, value]) => {
        cls.set(key as keyof ClsStore, value);
      });
    },
  };
}
