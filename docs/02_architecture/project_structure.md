# 프로젝트 및 레포지토리 구조 설계 (요약)

## 1. 모노레포 관리 전략

* **방식**: Turborepo/Nx 기반 Monorepo 채택으로 개발 효율성 극대화
* **공유**: 패키지 단위(Types, Security, DB Entity) 공유를 통한 코드 파편화 방지

## 2. 주요 디렉토리 구조

* **apps/**: 실행 가능한 서비스 (Admin Web, Partner Web, Core/Auth API, Gateway)
* **packages/**: 공통 라이브러리 (Shared DB Schema, Security Module, UI Components, Types)
* **infra/**: IaC 기반 리소스 관리 (Terraform, Kubernetes Manifests, Docker configs)
* **docs/**: 프로젝트 기술 및 사업 통합 문서

## 3. 품질 및 운영 표준

* **코드 품질**: 전사 공통 Linting/Formatting 룰 및 Swagger 기반 API 자동 문서화 적용
* **테스트**: 서비스별 Unit Test 및 시스템 통합(Integration) 테스트 필수 수행
* **Git Flow**: 브랜치 전략(main, develop, feature, release, hotfix) 기반의 체계적 릴리즈 관리
