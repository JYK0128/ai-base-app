# 프로젝트 표준 및 요구사항 (Standards & Requirements)

## 1. 템플릿 소스 (Template Source)

- **공식 위치**: `.agents/skills/monorepo-scaffolding-guide/assets/base-package` (작업 공간 루트 기준)

---

## 2. 표준 및 요구사항 (Standards)

### 2.1. 설정 파일 관리 (Configuration)

- **package.json**
  - 명명 규칙: `@pkg/<project-name>`, `<service-name>`, `<app-name>` 중 택일
  - 버전 정보: `0.1.0`으로 초기화 필수
- **eslint.config.mjs**
  - 다음 중 프로젝트 성격에 맞는 공유 설정을 반드시 상속(extend):
    - `@pkg/config/eslint/react`
    - `@pkg/config/eslint/nest`
    - `@pkg/config/eslint/node`
- **TypeScript (tsconfig)**
  - 모노레포 호환성을 위해 템플릿의 `tsconfig` 구조를 엄격히 준수

### 2.2. 의존성 관리 (Dependencies)

- **공통 필수**:
  - `@pkg/config`: 공유 툴체인 및 환경 설정용
  - `@pkg/shared`: 비즈니스 로직 및 공통 유틸리티 공유용
- **백엔드 서비스 전용**:
  - `@pkg/database`: ORM 엔티티 정의, 데이터베이스 접근이 필요한 백엔드 서비스에 사용
- **프론트엔드 앱 전용**:
  - `@pkg/ui`: 디자인 시스템 및 스타일링 테마를 적용, 공통 UI 컴포넌트가 필요한 프론트 서비스에 사용

### 2.3. 헬스체크 표준 (Health Check)

- **HTTP 앱 (Nest/Express 등)**
  - `/health/live`: 프로세스 생존 확인용
  - `/health/ready`: 외부 의존성(RabbitMQ, DB 등) 연결 가능 여부 확인용
  - Nest 기반 앱은 `@nestjs/terminus` 사용 권장
- **RMQ 전용 마이크로서비스**
  - 기본은 하이브리드(HTTP + microservice) 구성으로 health endpoint 제공
  - 하이브리드가 어려운 경우 `exec` probe 사용 가능
- **Kubernetes probe 매핑**
  - `startupProbe` -> `/health/live`
  - `livenessProbe` -> `/health/live`
  - `readinessProbe` -> `/health/ready`
- **기본 원칙**
  - `liveness`는 가볍고 빠르게, 외부 의존성 체크 최소화
  - `readiness`에서만 외부 의존성 체크 수행
  - 앱 코드의 health endpoint와 `.k8s` 매니페스트 probe 경로를 반드시 동일하게 유지
