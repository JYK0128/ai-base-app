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

## 3. 구축 워크플로우 (Setup Workflow)

1. **디렉토리 생성**: `packages/` 또는 `apps/` 하위에 프로젝트 폴더 생성
2. **템플릿 복사**: `base-project` 내의 모든 파일을 신규 디렉토리로 복사
3. **package.json 최적화**: 프로젝트명 수정 및 버전 초기화 (`0.1.0`)
4. **루트 설정 업데이트**: 루트 디렉토리의 `tsconfig.json` 내 `references` 항목에 신규 프로젝트 경로 추가
5. **워크스페이스 등록**: 루트 디렉토리에서 `pnpm install` 실행하여 의존성 동기화
6. **무결성 검증**: `pnpm lint` 또는 `npx eslint .`를 실행하여 설정 정상 작동 확인

## 4. 스킬 트리거 (Trigger Phrases)

- 새로운 프로젝트/패키지/앱 생성 요청
- 워크스페이스 내 모듈 추가 시
- 신규 서비스 초기화 및 설정 지원 요청
