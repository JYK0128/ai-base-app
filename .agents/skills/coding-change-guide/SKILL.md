---
name: coding-change-workflow
description: 코드 수정, 버그 수정, 리팩터링, 린트/타입 오류 해결, 기능 구현, API 계약 변경 등 모든 소스코드 변경 작업 공통 절차. 도메인 전용 스킬과 병행하여 영향 범위 확인, 구현, 검증 및 결과 보고 수행 시 사용. 계약/토큰/helper 같은 파일명 정리나 모듈 경계 재정의 작업에도 사용.
---

# Coding Change Workflow

- 특정 프레임워크 규칙이 아닌 코드 변경 작업의 표준 흐름을 정의함
- 도메인 전용 스킬이 존재할 시 해당 규칙을 선제 적용하고, 변경 절차는 본 스킬로 보완함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 가이드 및 체크리스트: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🔄 코드 변경 표준 프로세스 | 변경 범위 파악, 구현 원칙, 영향 범위 정리, 검증 기준(Type Check, Lint), 산출물 확인, 최종 보고 방식 | `references/01_workflow_steps.md` |
| 📝 Git 커밋 컨벤션 | 커밋 메시지 기본 구조, 타입 규격, 모노레포 Scope 가이드라인 | `references/02_git_commit_convention.md` |
| 🛡️ 최소 폴백 및 단일 신뢰 원천 | 데이터/로직 계층 Fail-Fast 규칙, UI Graceful Fallback 구현 사양, 엔티티/계약 Source of Trust 기준 | `references/03_minimal_fallback_and_trust.md` |

---

## 🔄 워크플로우 요약

1. **범위 파악**:
   - `rg` 등의 검색 도구를 활용하여 실제 참조 및 영향 범위를 사전 분석함
2. **구현**:
   - 변경 단위를 작게 유지하고, 기존 코드 스타일을 준수하며, 불필요한 추상화는 배제함
   - [최소 폴백 및 단일 신뢰 원천](file:///Users/server/Documents/GitHub/ai-base-app/.agents/skills/coding-change-guide/references/03_minimal_fallback_and_trust.md) 가이드에 정의된 Fail-Fast 및 Source of Trust 원칙을 필수로 적용함
3. **영향 검토**:
   - 엔티티, DTO, Helper, Generated Model, 테스트 코드 등의 영향 범위 해당 여부를 검증함
4. **검증**:
   - 변경 범위에 맞춰 `tsc --noEmit`, `eslint`, `stylelint` 등 검증 도구를 수행하여 오류를 해결함
5. **최종 보고**:
   - 구현 결과, 핵심 변경 파일, 검증 이력 등을 간결하게 정리하여 보고함
