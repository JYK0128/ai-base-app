# API Documentation: Service Gateway

이 문서는 `service-gateway`에서 제공하는 주요 API 엔드포인트에 대한 명세입니다.

## 1. Authentication (인증)

### 로그인 요청

이메일과 비밀번호를 기반으로 로그인을 시도하고, 감사 로그를 생성합니다.

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

**요청 본문 (Body)**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 예시 (200 OK)**:

```json
{
  "userId": "antigravity_user",
  "email": "user@example.com",
  "accountType": "user",
  "tenantId": "org-123",
  "tenantType": "organization",
  "clientIp": "127.0.0.1",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**내부 동작**:

1. `EventLogInterceptor`가 요청 정보(IP, Method, Path, Body)를 가로채 JSON 로그로 출력합니다.
2. `AUTH_SERVICE`(RabbitMQ)로 `auth.login` 명령을 전달합니다.
3. `platform-auth-service`에서 이메일로 계정을 조회하고 비밀번호를 검증한 뒤 JWT와 소속 tenant 정보를 발급합니다.

---

## 2. Testing & Events (테스트 및 이벤트)

### 테스트 이벤트 발행

RabbitMQ를 통해 단순 테스트용 이벤트를 발행합니다.

- **URL**: `/trigger-auth-event`
- **Method**: `GET`

**응답 예시 (200 OK)**:

```json
{
  "status": "Event emitted via RMQ",
  "payload": {
    "message": "Hello from Gateway!",
    "timestamp": "2026-04-14T09:12:00.000Z"
  }
}
```

### 유저 정보 조회 (Mock)

특정 유저의 정보를 조회합니다.

- **URL**: `/user`
- **Method**: `GET`

**응답 예시 (200 OK)**:

```json
{
  "userId": "user-123"
}
```

---

## 3. Infrastructure (인프라)

### 헬스 체크

서비스 및 시스템 구성 요소의 상태를 확인합니다.

- **URL**: `/health`
- **Method**: `GET`

---

## 공통 사항

### 전역 인터셉터 (Logging)

모든 API 호출은 `EventLogInterceptor`에 의해 기록됩니다. 로그는 다음과 같은 구조화된 JSON 형태로 애플리케이션 콘솔(stdout)에 출력됩니다:

```json
{
  "message": "POST /auth/login",
  "timestamp": "2026-04-14T00:00:00.000Z",
  "method": "POST",
  "url": "/auth/login",
  "ip": "127.0.0.1",
  "requestBody": { ... },
  "responseBody": { ... },
  "duration": "15ms"
}
```

*이 로그는 쿠버네티스 환경에서 수집 에이전트에 의해 중앙 로그 시스템(Loki/Grafana 등)으로 자동 전달됩니다.*
