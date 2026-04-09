# API 및 에러 표준 규약 (Enterprise API Standards)

## 1. 개요

MSA 환경에서 클라이언트가 여러 백엔드 서비스(Core, Auth, Program, Billing 등)와 통신할 때 겪는 혼란을 막기 위해 전사적으로 통일된 REST API 포맷과 통신 규격을 정의합니다.

* **OpenAPI (Swagger) 강제**: 모든 마이크로서비스는 `zod-to-openapi` 또는 NestJS 내장 Swagger를 통해 최신 API 명세를 `/api-docs` 경로에 노출해야 하며, 이를 기반으로 프론트엔드(TanStack Start)에서 타입을 자동 생성(Orval 등)합니다.

## 2. 공통 응답 포맷 (Success Payload Wrapped)

최상위 배열 반환에 따른 보안 취약점(JSON Hijacking)을 방지하고 프론트엔드(TanStack Query)의 데이터 핸들링 일관성을 위해 모든 성공(2xx) 응답은 `data` 객체로 래핑합니다. 페이징 데이터의 경우 `meta` 속성을 추가로 포함합니다.

```json
{
  "data": {
    "id": "uuid-v7",
    "name": "Enterprise Plan"
  },
  "meta": {
    "serverTime": "2026-04-09T09:00:00Z"
  }
}
```

## 3. 에러 규격 상세 (RFC 7807 Problem Details)

모든 에러 응답은 `Problem Details for HTTP APIs (RFC 7807)` 표준을 엄격히 준수합니다. 이를 통해 다국어 처리 및 에러 로깅을 통합합니다.

```json
{
  "type": "https://api.marketplace.com/errors/insufficient-funds",
  "title": "잔액이 부족합니다.",
  "status": 400,
  "detail": "결제를 진행하기 위한 지갑 잔액이 5,000 KRW 부족합니다.",
  "instance": "/billing/payments/req-1234",
  "extensions": {
    "organizationId": "uuid-v7",
    "traceId": "otel-trace-abc-123",
    "requiredAmount": 10000,
    "currentBalance": 5000
  }
}
```

## 4. 버전 관리 및 헤더 규약 (Versioning & Headers)

* **버전 관리 (API Versioning)**: 파괴적 변경(Breaking Change)이 일어날 경우 URI Path 기반 버저닝(`/v1/core/...`, `/v2/core/...`)을 채택하여 구버전 클라이언트의 하위 호환성을 보장합니다.
* **다국어 (I18n) 헤더**: 클라이언트는 브라우저 설정에 기반해 `Accept-Language: ko-KR` 헤더를 송신하며, Infra 서비스 및 Error Handler는 이를 인터셉트하여 번역된 `title`과 `detail`을 반환합니다.

## 5. 쓰로틀링 (Rate Limiting) 표준

비정상적인 트래픽 공격 및 리소스 고갈을 막기 위해 Redis 기반 처리량 제어를 시행하며, 응답 헤더에 할당량 정보를 제공합니다.

* `X-RateLimit-Limit`: 시간당 허용된 총 호출 횟수
* `X-RateLimit-Remaining`: 남은 호출 횟수
* `Retry-After`: 429 Too Many Requests 발생 시, 재시도 가능한 시점까지 남은 시간(초)

## 6. 페이지네이션 (Pagination)

데이터 특성에 따라 두 가지 규격을 혼용합니다.

1. **Cursor-based Pagination**: 무한 스크롤, 대규모 실시간 컨슈머(B2C) 데이터에 사용. (파라미터: `?cursor=xyz&limit=20`) -> 반환: `meta.nextCursor`
2. **Offset-based Pagination**: B2B `partner-web` 관리자 대시보드의 정적/단발적 테이블 조회 테이블뷰에 사용. (파라미터: `?page=1&pageSize=50`) -> 반환: `meta.totalPages`

## 7. 멱등성 보장 (Idempotency)

결제(`/billing/payments`) 및 주요 상태 변경 API는 POST 요청 시 HTTP Header에 `X-Idempotency-Key`를 필수로 요구합니다. `Redis`에 해당 키를 24시간 해시 보관하여 모바일 환경의 네트워크 지연/재시도로 인한 중복 결제를 원천 차단합니다.

## 8. 동적 CORS 및 보안 정책 (CORS & Security)

본 플랫폼은 조직별 커스텀 도메인(`customDomain`)을 지원하므로 고정된 Whitelist 대신 동적 CORS 처리를 수행합니다.

* **Dynamic Origin**: 요청 헤더의 `Origin`이 `Core Service`에 등록된 조직의 허용된 도메인 리스트에 포함되어 있는지 매 요청마다 Redis 캐시를 통해 검증합니다.
* **Essential Headers**: `Strict-Transport-Security`, `X-Content-Type-Options`, `Content-Security-Policy` 등을 API Gateway 레벨에서 강제 주입하여 기본 보안을 강화합니다.
* **Global Request Timeout**: 서비스 간 연쇄 장애(Cascading Failure)를 방지하기 위해 모든 API 요청은 최대 **30초**의 전역 타임아웃을 가지며, 내부 MSA 통신은 5~10초 이내로 제한합니다.
* **PII Masking (개인정보 마스킹)**: 로그 및 응답 데이터에서 비밀번호, 주민번호, 계좌번호 등 민감한 개인식별정보(PII)는 반드시 마스킹(`***`) 처리하여 노출을 차단합니다.

## 9. 보안 및 규정 준수 (Compliance)

* **GDPR/PII**: 개인정보 마스킹 및 물리적 리전 격리를 통해 글로벌 규제를 준수합니다.
