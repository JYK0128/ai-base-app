import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Ensure to call this before requiring any other modules!
// Sentry v10 최신 규격에 따른 초기화 설정입니다.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // 프로파일링 통합 추가
    nodeProfilingIntegration(),
  ],

  // Tracing 활성화 (샘플링 비율 설정)
  // 프로덕션 환경에서는 이 값을 적절히 조절하는 것을 권장합니다.
  tracesSampleRate: 1.0,

  // 프로파일링 샘플링 비율
  // tracesSampleRate 에 대한 상대적 비율입니다.
  profilesSampleRate: 1.0,
});
