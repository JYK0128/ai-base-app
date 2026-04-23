import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { configureApp } from '@/main';

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface LoginData {
  accessToken: string
  userId: string
  email: string
  passwordChangeRequired: boolean
}

interface RefreshData {
  accessToken: string
}

describe('Auth gateway e2e', () => {
  let gatewayApp: NestExpressApplication;

  async function bootstrapGatewayApp() {
    const { AppModule: GatewayAppModule } = await import('@/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [GatewayAppModule],
    }).compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    // main.ts의 공통 설정 적용
    configureApp(app);

    await app.init();
    return app;
  }

  beforeAll(async () => {
    gatewayApp = await bootstrapGatewayApp();
  });

  afterAll(async () => {
    if (gatewayApp) {
      await gatewayApp.close();
    }
  });

  it('logs in, refreshes, logs out, and invalidates the session through the gateway', async () => {
    const agent = request.agent(gatewayApp.getHttpServer());

    const loginDto = {
      email: 'test@example.com',
      password: 'pass1234',
    };

    // 1. 로그인
    const loginResponse = await agent.post('/api/v1/auth/login').send(loginDto);
    expect(loginResponse.status).toBe(201);

    const loginBody = loginResponse.body as ApiResponse<LoginData>;
    expect(loginBody).toMatchObject({
      success: true,
      data: {
        accessToken: expect.any(String) as string,
        userId: expect.any(String) as string,
        email: 'test@example.com',
        passwordChangeRequired: false,
      },
    });

    expect(loginResponse.header['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );

    const accessToken = loginBody.data.accessToken;

    // 2. 내 정보 조회 (Access Token 사용, 쿠키는 agent가 자동 전송)
    const meResponse = await agent
      .get('/api/v1/auth/me')
      .set('authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);

    // 3. 토큰 갱신 (쿠키는 agent가 자동으로 실어 보냄)
    const refreshResponse = await agent.post('/api/v1/auth/refresh');
    expect(refreshResponse.status).toBe(201);

    const refreshBody = refreshResponse.body as ApiResponse<RefreshData>;
    expect(refreshBody).toMatchObject({
      success: true,
      data: {
        accessToken: expect.any(String) as string,
      },
    });

    // 4. 로그아웃
    const logoutResponse = await agent
      .post('/api/v1/auth/logout')
      .set('authorization', `Bearer ${refreshBody.data.accessToken}`);

    expect(logoutResponse.status).toBe(201);

    // 5. 로그아웃 후 내 정보 조회 (실패해야 함)
    const meAfterLogout = await agent
      .get('/api/v1/auth/me')
      .set('authorization', `Bearer ${refreshBody.data.accessToken}`);

    expect(meAfterLogout.status).toBe(401);

    // 6. 로그아웃 후 토큰 갱신 (실패해야 함)
    const refreshAfterLogout = await agent.post('/api/v1/auth/refresh');
    expect(refreshAfterLogout.status).toBe(401);
  }, 120_000);
});
