# 프로젝트 및 레포지토리 구조 설계 (요약)

## 1. 모노레포 관리 전략

* **방식**: Turborepo 기반 Monorepo로 `apps/*`, `web/*`, `packages/*` 워크스페이스를 통합 관리함.
* **공유**: UI/Utils/Database/Config 패키지를 분리해 앱 간 중복 구현을 최소화함.

## 2. 현재 기준 주요 디렉토리 구조

* **apps/**: 실행 가능한 백엔드 애플리케이션(현재 `platform-auth-service`, `service-gateway`)을 관리함.
* **web/**: 실행 가능한 프론트엔드 애플리케이션(현재 `platform-admin-web`)을 관리함.
* **packages/**: 공통 라이브러리
  * `config/`: ESLint·TypeScript·Stylelint 등 공통 빌드/정적분석 설정 (ESM 지원을 위해 .mjs 사용)
  * `database/`: MikroORM 기반 도메인 엔티티/리포지토리/시더
  * `ui/`: 재사용 UI 컴포넌트 및 Storybook
  * `utils/`: 프레임워크 비의존 유틸/도메인 서비스
* **mobile/**: 모바일 앱 워크스페이스 예약 경로(현재 활성 패키지 없음).
* **.docs/**: 제안·아키텍처·명세·운영/개발 가이드·레퍼런스 문서
* **.k8s/**: Kubernetes 배포 리소스

## 3. 품질 및 운영 표준

* **코드 품질**: 루트 워크스페이스 설정을 기준으로 Lint/Format 규칙을 공통 적용함.
* **테스트**: 패키지 단위 테스트(Vitest)와 서비스별 테스트(`apps/*`, `web/*`)를 분리 운영함.
* **DB 변경 관리**: `@pkg/database`에서 마이그레이션/시더 스크립트를 일원화하여 스키마 변경 이력을 추적함.
