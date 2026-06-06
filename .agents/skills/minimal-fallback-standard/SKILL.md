---
name: minimal-fallback-standard
description: 시스템 및 애플리케이션의 데이터/비비즈니스 계층의 Fail-Fast(즉시 실패) 원칙과 프론트엔드 표현 계층의 Graceful Fallback(우아한 시각적 폴백) 설계 표준 정의. 객체/DTO 정제, 환경 변수 누락, 비즈니스 규칙 부재 시 기본값 남용 차단 및 UI 수준의 에러/로딩 폴백 설계가 요구될 때 필수 사용.
---

# Minimal Fallback Standard (최소 폴백 설계 표준)

- 본 스킬은 시스템의 무결성을 보호하기 위해 데이터/로직 계층에서는 오류를 감추지 않고 즉시 노출하며(Fail-Fast), 사용자 경험(UX)을 보호하기 위해 표현 계층(UI/UX)에서는 우아하게 대처(Graceful Degradation)하는 이원화된 설계 원칙을 규정함.

---

## 1. 데이터 및 비즈니스 계층 (Data & Logic Layer): Fail-Fast 원칙

### 1.1 기본값 (Default Value) 대입의 제한

- 비즈니스 로직 연산, 데이터 모델 변환, 지속성 객체 저장 시점에 필수 데이터가 누락되거나 유실된 상황에서 임의의 기본값(예: 임의의 빈 문자열, 임의의 기본 상태값)을 대입해 오류 상황을 무마하는 행위를 차단함.

- 유실된 필수 데이터는 시스템 내부에 오염된 채로 흐르지 않도록 즉각적이고 정직하게 실패(Fail-Fast)해야 함.

### 1.2 환경 변수 및 핵심 설정의 엄격성

- 시스템 기동과 서비스 무결성에 직결되는 핵심 구성 설정(Configuration)이 유실된 경우, 임의의 기본값으로 시동을 우회하는 대신 즉시 기동을 중단하고 치명적 예외를 발생시킴.

- [??] 시스템 중단을 유발하지 않는 비핵심적인 부가 옵션(예: 디버그 모드, 최대 캐시 만료 시간 등)에 한해서만 합리적인 기본값(Default)을 허용함.

### 1.3 데이터 정제와 검증의 분리

- 데이터가 경계면(API Gateway, 외부 서비스 호출, 데이터베이스 저장소)을 넘어설 때, 스펙에 어긋나는 타입이나 누락된 속성을 검증하여 규칙 미달 시 즉시 차단함.

- [??] 단순히 직렬화 규격(JSON payload, Token payload 등)에 맞추기 위해 불필요한 속성(null, undefined)을 제거하는 정제(Sanitization) 작업은 데이터 가공이 아닌 규격 정리 수준으로 제한함.

---

## 2. 표현 계층 (Presentation Layer): Graceful Fallback 원칙

### 2.1 런타임 에러 전파 차단 (Error Boundary)

- 개별 컴포넌트나 라우트 범위에서 런타임 오류가 발생했을 때, 에러가 어플리케이션 전체로 전파되어 화면이 멈추는 현상을 완전 차단함.

- 에러가 발생한 영향 범위를 격리하고, 에러 스택을 감지하여 사용자 친화적인 폴백 컴포넌트(복구 및 재시도 기능 포함)로 대체 렌더링함.

### 2.2 비동기 로딩 및 빈 상태 시각화

- 데이터 로딩 상태(Loading/Pending)와 데이터가 없는 빈 상태(Empty State)를 단순한 공백 화면으로 방치하지 않음.

- 화면의 골격 레이아웃(Skeleton) 또는 명확한 안내 템플릿을 제공하여 사용자가 시스템 상태를 즉시 예측할 수 있도록 시각적 피드백을 제공함.

### 2.3 대체 그래픽 및 리소스 바인딩

- 외부 미디어 자원이나 이미지 로딩 실패 시, 브라우저의 깨진 이미지 마크를 차단하고 기본 그래픽 테두리나 대체 수단을 노출함.

---

## 3. 올바른 구현 패턴 예시 (Generic Patterns)

### 3.1 비즈니스 로직 및 설정 (Fail-Fast)

**나쁜 예 (오류를 기본값으로 덮어 숨김):**

```typescript
// 유실된 중요 설정이나 데이터를 빈 값으로 덮어씌워 논리 오류 발생 가능성을 높임
const apiEndpoint = config.endpoint || "";
const userRole = account.role || "MEMBER"; 
```

**좋은 예 (명시적인 유효성 실패 검출):**

```typescript
// 유실된 중요 데이터는 즉시 예외를 발생시키거나 검증 실패를 리턴함
if (!config.endpoint) {
  throw new ConfigurationError("API endpoint configuration is required");
}

if (!account.role) {
  throw new ValidationError("User role must be defined");
}
```

### [??] 3.2 경계면 데이터 정제 (Payload Sanitization)

**좋은 예 (선택적 필드 전달 시 무효 데이터 제거):**

```typescript
// 데이터 가공이 아닌 규격 정제를 통해 전송 정합성을 유지함
const cleanPayload = sanitize(rawPayload);
```

### 3.3 화면 표현 계층 (UI Fallback)

**좋은 예 (시각적 안전망 결합):**

```tsx
// 에러 경계면과 비동기 로딩을 계층화하여 전체 화면을 보호함
<ErrorBoundary fallback={({ error, reset }) => <ErrorView error={error} onRetry={reset} />}>
  <Suspense fallback={<LoadingView />}>
    <DataPresenter data={data} />
  </Suspense>
</ErrorBoundary>
```

---
*최종 업데이트: 2026-06-07*
