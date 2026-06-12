---
name: nest-cqrs-guide
description: NestJS CQRS message, handler, event, and error structure guidance. Use when working on command/query/event classes, handlers, contracts, DTOs, ExceptionGuard-based errors, and CQRS tests.
---

# NestJS CQRS Guide

- NestJS CQRS 메시지, 핸들러, 이벤트, 에러 구조를 다룰 때 사용하는 가이드
- command/query/event 클래스, handler, contract, DTO, ExceptionGuard 기반 에러, CQRS 테스트 작업에 사용
- CQRS 파일을 추가/수정/분리할 때 이 스킬을 우선 적용

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 가이드 및 체크리스트: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🏛️ 1. 핵심 아키텍처 원칙 | 메시지/핸들러/이벤트/에러의 역할 분리, 사실 기반 이벤트, 명시적 계약 | `references/01_architecture_principles.md` |
| 📂 2. 도메인 및 디렉토리 구조 | feature-first 구조, 파일 역할, 중첩 규칙, export/import 기준 | `references/02_directory_structure.md` |
| 🛠️ 3. 핵심 구성 요소 구현 | 메시지 클래스, 핸들러, 에러/어서터, 이벤트, DTO/contract 작성 기준 | `references/03_implementation_details.md` |
| 🧪 4. 테스트 및 린트 | CQRS 테스트 방식, import 정리, 타입체크/린트 검증 기준 | `references/04_testing_and_lint.md` |

---

## 🔄 워크플로우 요약

1. **대상 파악**:
   - 변경 대상이 command, query, event, handler, DTO, error 중 무엇인지 먼저 분류함
2. **구조 참조**:
   - 위 참조 파일에서 역할 분리와 디렉토리 기준을 확인함
3. **구현**:
   - 메시지와 핸들러를 분리하고, payload와 결과를 명시적으로 유지함
4. **검증**:
   - 구조 변경 후 타입체크와 린트를 실행함
5. **정리**:
   - 불필요한 import, 충돌하는 파일명, 과한 추상화를 제거함
