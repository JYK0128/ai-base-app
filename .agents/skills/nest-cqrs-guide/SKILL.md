---
name: nest-cqrs-guide
description: NestJS CQRS 핸들러 및 에러/어서터 구조 작성 가이드. 세 개 파일 분할(Command/Query, Error, Handler), contract/token/helper 파일 분리, ExceptionGuard 기반 다국어/메타데이터 에러 핸들링 및 Vitest 단위 테스트 가이드 정의. CQRS/에러/테스트 관련 요청 발생 시 필수 사용.
---

# NestJS CQRS & Exception Guard 아키텍처 표준 가이드

- NestJS CQRS 아키텍처 및 선언적 에러 핸들링(`ExceptionGuard`) 표준 수립
- 프로젝트 내 모든 Command 및 Query 핸들러 작성 시 엄격 준수함
- 실제 코드 수정, 영향 범위 확인, 타입체크/린트/빌드 검증 시 `coding-change-workflow` 스킬을 함께 적용함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 구현 사항 및 가이드: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🏛️ 1. 핵심 아키텍처 원칙 | 삼중 분리 원칙, 선언적 예외 처리, 단일 오케스트레이션 정의 | `references/01_architecture_principles.md` |
| 📂 2. 도메인 및 디렉토리 구조 | 디렉토리 레이아웃 표준, 파일 규칙, 모듈 통합 및 핸들러 자동 등록 가이드 | `references/02_directory_structure.md` |
| 🛠️ 3. 핵심 구성 요소 구현 | Command/Query DTO, 에러 정의 및 어서터, 핸들러(`*.handler.ts`) 작성 및 트랜잭션 규칙 | `references/03_implementation_details.md` |
| 🧪 4. 테스트 및 린트 | Vitest 기반 단위 테스트 작성 표준, Import 규칙 및 린트 가이드 | `references/04_testing_and_lint.md` |

---

## 🔄 워크플로우

1. **대상 파악**:
   - 구현/수정 대상 NestJS CQRS 요소가 Command인지 Query인지 분류함
2. **구현 상세 참조**:
   - 상기 참조 파일에서 핵심 규칙(예: Asserter 단일 호출 구조, Flat 구조화 등)을 확인함
3. **코드 작성**:
   - 삼중 파일 분리 규칙(`*.command.ts` / `*.query.ts`, `*.error.ts`, `*.handler.ts`)을 엄격 적용하여 구현함
4. **검증**:
   - `coding-change-workflow` 스킬의 검증 단계에 맞추어 타입 체크 및 Vitest 단위 테스트를 실행함
