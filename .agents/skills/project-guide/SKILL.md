---
name: base-project-guide
description: 모노레포 내 신규 프로젝트/패키지 생성 시 "base-project" 템플릿 준수 여부를 확인 및 강제함.
---

# 기본 프로젝트 가이드 (Base Project Guide)

본 스킬은 `base-project` 템플릿 사용을 강제하여 AI Base App 모노레포의 표준화된 개발 환경을 구축하고 유지함.

## 1. 템플릿 소스 (Template Source)

- **공식 위치**: `c:\Users\wlsyo\Documents\GitHub\ai-base-app\.agents\skills\project-guide\resource\base-project`

## 2. 표준 및 요구사항 (Standards)

### 2.1 설정 파일 관리 (Configuration)

- **package.json**
  - 명명 규칙: `@pkg/<project-name>`, `<service-name>`, `<app-name>` 중 택일
  - 버전 정보: `0.1.0`으로 초기화 필수
- **eslint.config.js**
  - 다음 중 프로젝트 성격에 맞는 공유 설정을 반드시 상속(extend):
    - `@pkg/config/eslint/react`
    - `@pkg/config/eslint/nest`
    - `@pkg/config/eslint/node`
- **TypeScript (tsconfig)**
  - 모노레포 호환성을 위해 템플릿의 `tsconfig` 구조를 엄격히 준수

### 2.2 핵심 의존성 (Core Dependencies)

- **@pkg/config**: 공유 툴체인 및 환경 설정용
- **@pkg/database**: 시스템 공통 데이터베이스 패턴 적용용

### 2.3 헬스체크 표준 (Health Check)

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

## 3. 구축 워크플로우 (Setup Workflow)

1. **디렉토리 생성**: `packages/` 또는 `apps/` 하위에 프로젝트 폴더 생성
2. **템플릿 복사**: `base-project` 내의 모든 파일을 신규 디렉토리로 복사
3. **package.json 최적화**: 프로젝트명 수정 및 버전 초기화 (`0.1.0`)
4. **루트 설정 업데이트**: 루트 디렉토리의 `tsconfig.json` 내 `references` 항목에 신규 프로젝트 경로 추가
5. **워크스페이스 등록**: 루트 디렉토리에서 `pnpm install` 실행하여 의존성 동기화
6. **헬스체크 구성**: 프로젝트 성격에 맞는 `/health/live`, `/health/ready` 및 probe 전략을 구성
7. **무결성 검증**: `pnpm lint` 또는 `npx eslint .`를 실행하여 설정 정상 작동 확인
8. **런타임 검증**: 배포 후 `kubectl describe pod`에서 probe 실패 이벤트가 없는지 확인

## 4. 스킬 트리거 (Trigger Phrases)

- 새로운 프로젝트/패키지/앱 생성 요청
- 워크스페이스 내 모듈 추가 시
- 신규 서비스 초기화 및 설정 지원 요청

<!-- TODO: PACKAGE, API, FRONT  -->