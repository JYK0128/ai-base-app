# 도메인 독립형 i18n 서비스 아키텍처

## 목차

1. 시스템 개요
2. 데이터 모델
3. API 설계
4. 조회 규칙
5. 검증
6. 데이터 흐름
7. 성능 최적화
8. 테스트 계획

---

## 시스템 개요

### 핵심 원칙

- **도메인 독립성**: 어떤 제품 기능에도 종속되지 않는 공통 i18n 서비스로 둡니다.
- **범용성**: `namespace`, `key`, `locale`, `value` 조합으로 모든 문자열을 관리합니다.
- **단순성**: 번역 본문은 하나의 `translations` 테이블에 모읍니다.
- **일관성**: 저장, 조회, 수정, 삭제, 벌크 처리의 규칙을 한 곳에서 통제합니다.
- **성능**: 배치 조회, 캐시, 인덱스 최적화를 기본 전제로 둡니다.
- 조회 응답의 시스템 값은 `data.meta`에 넣습니다.

### 설계 전략

이 서비스는 문자열 저장소가 아니라 **번역 엔진**에 가깝습니다.

- 식별 축은 `namespace + key + locale` 입니다.
- 실제 문장은 `value` 하나로 저장합니다.
- 표현식은 ICU MessageFormat 호환을 전제로 합니다.
- 조회 결과는 요청 언어와 실제 응답 언어를 분리해 반환합니다.

---

## 데이터 모델

### 1. locale 테이블

지원 로케일과 기본 로케일, 활성 상태를 관리합니다.

### 용어 규칙

- `code`: locale code입니다. 예: `ko`, `en`, `ja`, `zh-CN`
- `region_code`: territory/region code입니다. 예: `KR`, `US`, `JP`, `CN`

```sql
CREATE TABLE "locale" (
  "id" varchar(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "code" varchar(20) UNIQUE NOT NULL,          -- locale code: 'ko', 'en', 'ja', 'zh-CN', 'zh-TW'
  "display_name" varchar(100) NOT NULL,        -- 'Korean', 'English', ...
  "native_name" varchar(100) NOT NULL,         -- '한국어', 'English', ...
  "region_code" varchar(10),                   -- region/territory code: 'KR', 'US', 'JP', ...
  "direction" varchar(10) NOT NULL DEFAULT 'ltr',
  "is_active" boolean NOT NULL DEFAULT true,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_locale_code ON "locale" ("code");
CREATE INDEX idx_locale_active ON "locale" ("is_active");
CREATE INDEX idx_locale_default ON "locale" ("is_default");
```

초기 데이터 예시:

```sql
INSERT INTO "locale" ("code", "display_name", "native_name", "region_code", "is_default") VALUES
('ko', 'Korean', '한국어', 'KR', true),
('en', 'English', 'English', 'US', false),
('ja', 'Japanese', '日本語', 'JP', false),
('zh-CN', 'Simplified Chinese', '简体中文', 'CN', false),
('zh-TW', 'Traditional Chinese', '繁體中文', 'TW', false);
```

### 2. translations 테이블

번역 본문을 단일 테이블에서 관리합니다.

```sql
CREATE TABLE "translations" (
  "id" varchar(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "namespace" varchar(100) NOT NULL,           -- 'auth', 'ui', 'error', 'email'
  "key" varchar(150) NOT NULL,                 -- 'login.button', 'network.timeout'
  "locale_code" varchar(20) NOT NULL REFERENCES "locale"("code"),
  "value" text NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "deleted_at" timestamp,
  UNIQUE ("namespace", "key", "locale_code")
);

CREATE INDEX idx_translations_namespace ON "translations" ("namespace");
CREATE INDEX idx_translations_key ON "translations" ("key");
CREATE INDEX idx_translations_locale ON "translations" ("locale_code");
CREATE INDEX idx_translations_lookup ON "translations" ("namespace", "key", "locale_code");
CREATE INDEX idx_translations_deleted ON "translations" ("deleted_at");
```

### 기본값 규칙

- `is_default`: 기본 locale에 해당하는 값을 표시할 때 사용합니다.

### ICU MessageFormat 전제

`value`는 문자열이지만, 내용은 ICU MessageFormat 호환을 전제로 합니다.

예:

```text
Hello, {name}
You have {count, plural, one {# message} other {# messages}}
```

---

## API 설계

### 핵심 원칙

- 로케일은 쿼리 파라미터 또는 `Accept-Language` 헤더로 결정합니다.
- 조회 응답에는 항상 `requestedLocale`, `resolvedLocale`, `availableLocales`를 포함합니다.
- 단건 조회와 배치 조회를 모두 1급 기능으로 제공합니다.
- 변경 API는 `POST`만 사용합니다.

### 동작 정의

- **단건 조회 폴백**: 요청 locale이 없거나 비활성인 경우 기본 locale로 폴백합니다.
- **배치 조회 입력**: `keys`와 `locale`을 기본 입력으로 사용합니다. 필요하면 `namespace` 단위 필터를 추가할 수 있습니다.
- **단건 생성 규칙**: `POST /i18n/translations`는 기본적으로 upsert로 동작합니다. 같은 `namespace + key + locale`이 있으면 값을 갱신합니다.
- **삭제 규칙**: `POST /i18n/translations/delete`는 soft delete로 처리합니다.

### REST API

#### GET /i18n/locales

활성 locale 목록을 조회합니다.

응답 예시:

```json
{
  "data": [
    {
      "code": "ko",
      "displayName": "Korean",
      "nativeName": "한국어",
      "regionCode": "KR",
      "direction": "ltr",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

요청:

- 쿼리나 본문 없이 호출합니다.

#### GET /i18n/translations/:namespace/:key?locale=ko

특정 키의 번역을 조회합니다.

응답 예시:

```json
{
  "data": {
    "meta": {
      "requestedLocale": "en",
      "resolvedLocale": "en",
      "availableLocales": ["ko", "en"]
    },
    "item": {
      "namespace": "auth",
      "key": "login.button",
      "value": "Sign in"
    }
  }
}
```

#### GET /i18n/translations

여러 키를 한 번에 조회합니다.

주요 용도:

- 초기 화면 렌더링
- 다중 문자열 동시 조회
- 캐시 효율화

요청 예시:

```text
/i18n/translations?keys=auth.login.button,error.network.timeout&locale=en
```

응답 예시:

```json
{
  "data": {
    "meta": {
      "requestedLocale": "en",
      "resolvedLocale": "en",
      "availableLocales": ["ko", "en"]
    },
    "items": [
      {
        "namespace": "auth",
        "key": "login.button",
        "value": "Sign in"
      },
      {
        "namespace": "error",
        "key": "network.timeout",
        "value": "Network timeout"
      }
    ]
  }
}
```

#### POST /i18n/translations

새 번역을 생성합니다.

요청 예시:

```json
{
  "namespace": "auth",
  "key": "login.button",
  "locale": "ko",
  "value": "로그인"
}
```

동작:

- 동일한 `namespace + key + locale`이 없으면 생성합니다.
- 동일한 항목이 있으면 값을 갱신합니다.

응답 예시:

```json
{
  "data": {
    "meta": {
      "operation": "upsert"
    },
    "item": {
      "namespace": "auth",
      "key": "login.button",
      "locale": "ko",
      "value": "로그인"
    }
  }
}
```

#### POST /i18n/translations/bulk

여러 번역 항목을 한 번에 생성, 수정, 삭제합니다.

동작:

- JSON 배열 기반 요청을 받습니다.
- 각 항목은 `create`, `update`, `delete` 중 하나의 작업을 가집니다.
- 한 요청 안에서 여러 작업을 묶어 처리합니다.

요청 예시:

```json
{
  "items": [
    {
      "operation": "create",
      "namespace": "auth",
      "key": "login.button",
      "locale": "ko",
      "value": "로그인"
    },
    {
      "operation": "update",
      "namespace": "error",
      "key": "network.timeout",
      "locale": "en",
      "value": "Network request timed out"
    },
    {
      "operation": "delete",
      "namespace": "ui",
      "key": "menu.settings",
      "locale": "ko"
    }
  ]
}
```

응답 예시:

```json
{
  "data": {
    "meta": {
      "createdCount": 1,
      "updatedCount": 1,
      "deletedCount": 1
    },
    "items": [
      {
        "operation": "create",
        "namespace": "auth",
        "key": "login.button",
        "locale": "ko",
        "value": "로그인"
      },
      {
        "operation": "update",
        "namespace": "error",
        "key": "network.timeout",
        "locale": "en",
        "value": "Network request timed out"
      },
      {
        "operation": "delete",
        "namespace": "ui",
        "key": "menu.settings",
        "locale": "ko"
      }
    ]
  }
}
```

#### POST /i18n/translations/delete

특정 locale의 번역을 삭제합니다.

동작:

- 실제 행을 즉시 삭제하지 않고 `deleted_at`을 채웁니다.
- 조회 시에는 삭제된 항목을 제외합니다.

요청 예시:

```json
{
  "namespace": "auth",
  "key": "login.button",
  "locale": "ko"
}
```

응답 예시:

```json
{
  "data": {
    "meta": {
      "deleted": true
    },
    "item": {
      "namespace": "auth",
      "key": "login.button",
      "locale": "ko"
    }
  }
}
```

---

## 조회 규칙

### 로케일 해석 우선순위

1. 요청 파라미터의 명시 locale
2. `Accept-Language` 헤더
3. 기본 locale

### 폴백 규칙

- 요청 locale이 비활성 상태이면 기본 locale로 폴백합니다.
- 요청 locale의 번역 값이 없으면 같은 key의 기본 locale 값을 반환합니다.
- 기본 locale 값이 없으면 `resolvedLocale`와 `value`를 비워서 응답하거나, 정책에 따라 404 또는 204를 반환합니다.

### 응답 메타데이터

모든 조회 응답의 시스템 값은 `data.meta`에 포함합니다.

### 배치 조회 원칙

- 여러 키를 하나의 쿼리로 묶습니다.
- locale별 중복 조회를 피합니다.
- 응답은 key 단위로 정규화합니다.

예시 응답:

```json
{
  "data": {
    "meta": {
      "requestedLocale": "en",
      "resolvedLocale": "en",
      "availableLocales": ["ko", "en"]
    },
    "items": [
      {
        "namespace": "auth",
        "key": "login.button",
        "value": "Sign in"
      },
      {
        "namespace": "error",
        "key": "network.timeout",
        "value": "Network timeout"
      }
    ]
  }
}
```

---

## 검증

### 검증 항목

- locale code는 `locale` 테이블 기준으로 검증합니다.
- 비활성 locale은 쓰기/조회에서 차단합니다.
- `namespace + key + locale` 조합의 중복을 허용하지 않습니다.
- namespace와 key는 정해진 패턴만 허용합니다.
- placeholder 규칙이 다른 locale 간에는 형식 검증을 수행합니다.

### 이름 규칙

- namespace는 짧고 범용적인 식별자를 사용합니다.
- key는 점 표기법을 사용합니다.
- 대소문자 규칙은 서비스 전반에서 하나로 고정합니다.

예:

- namespace: `auth`
- key: `login.button`
- key: `network.timeout`

### 캐시 정책

- locale 목록은 장기 캐시합니다.
- namespace, key, locale 조합은 짧은 TTL 또는 무효화 이벤트 기반으로 관리합니다.
- bulk update 시 관련 key 집합을 한 번에 무효화합니다.

---

## 데이터 흐름

### 1. 번역 생성 흐름

```
클라이언트 POST /i18n/translations
  ↓
{ namespace, key, locale, value }
  ↓
API Handler
  ├─ locale 유효성 검사
  ├─ namespace 형식 검사
  ├─ key 형식 검사
  └─ translations upsert
  ↓
응답
```

### 2. 번역 삭제 흐름

```
클라이언트 POST /i18n/translations/delete
  ↓
{ namespace, key, locale }
  ↓
API Handler
  ├─ locale 유효성 검사
  ├─ translations 조회
  └─ deleted_at 갱신
  ↓
응답
```

### 3. 번역 조회 흐름

```
클라이언트 GET /i18n/translations/auth/login.button?locale=ko
  ↓
API Handler
  ├─ locale 해석
  ├─ translations 조회
  ├─ 폴백 locale 확인
  └─ 응답 정규화
  ↓
응답
```

### 4. 배치 조회 흐름

```
클라이언트 GET /i18n/translations?keys=auth.login.button,error.network.timeout&locale=en
  ↓
API Handler
  ├─ 키 목록 파싱
  ├─ 단일 쿼리로 조회
  ├─ 누락 locale 폴백 처리
  └─ key 단위 응답 구성
  ↓
배치 응답
```

---

## 성능 최적화

### 인덱스 전략

- `locale.code`
- `translations(namespace, key, locale_code)`
- `translations(locale_code)`
- `translations(deleted_at)`

### 쿼리 최적화

- 단건 조회는 `namespace + key + locale` 기준으로 바로 찾습니다.
- 배치 조회는 key 목록을 한 번에 조회합니다.
- namespace 단위 조회는 동일 namespace의 key와 value를 함께 가져옵니다.

### 캐시 전략

```typescript
// locale 목록
const localeCacheKey = 'i18n:locales:active';

// 단건 번역
const translationCacheKey = `i18n:${namespace}:${key}:${locale}`;

// namespace 단위 무효화
const namespaceInvalidateKey = `i18n:${namespace}:*`;
```

### 벌크 처리

- bulk upsert는 중복 검사와 저장을 분리하지 않고 한 흐름으로 처리합니다.

---

## 테스트 계획

- locale 해석 우선순위를 검증합니다.
- 기본 locale 폴백을 검증합니다.
- `namespace + key + locale` 중복 방지를 검증합니다.
- 단건 조회와 배치 조회 결과가 동일한 의미를 갖는지 검증합니다.
- ICU MessageFormat placeholder 검증을 추가합니다.
- 업데이트 후 캐시 무효화가 정상 동작하는지 확인합니다.

### 권장 테스트 케이스

1. 요청 locale이 있을 때 해당 locale이 우선되는지 확인합니다.
2. 요청 locale이 비활성일 때 기본 locale로 폴백되는지 확인합니다.
3. key는 존재하지만 locale 값이 없을 때 기본 locale 값을 반환하는지 확인합니다.
4. bulk upsert 시 일부 항목 실패가 전체 롤백되는지 확인합니다.
5. placeholder 형식이 다른 locale 간에 경고 또는 실패가 나는지 확인합니다.
