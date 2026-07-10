---
name: mikro-orm-entity-guide
description: MikroORM 엔티티 작성 및 수정 가이드. CoreEntity 상속과 static query API, T | null 저장 필드, Opt 기반 create payload 생략, Rel 기반 관계, typed embeddable, policy/constants 분리, metadata·dist 타입 재생성을 다룸. packages/database의 엔티티·필드·관계·데코레이터·스키마 변경 시 필수 사용.
---

# MikroORM Entity Guide

- `packages/database` 내 MikroORM 엔티티를 일관성 있게 생성 및 수정하기 위한 개발 규칙 정의
- 엔티티 수정 시 platform-service DTO와 web generated model까지 영향을 추적하고 소스 코드, ORM metadata, dist 타입, 타입검사를 함께 검증함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 규칙 및 구현 코드: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🏛️ 1. 기본 원칙 & 파일 구조 | CoreEntity 상속, 파일명 규칙, 폴더 구조 및 Imports | `references/01_basics_and_file_structure.md` |
| 🗂️ 2. 필드 선언 규칙 | scalar 타입 및 Enum 선언 규칙, CoreEntity 필드 관리, Date 필드 정의 규칙 | `references/02_field_declarations.md` |
| 🛠️ 3. 메타데이터 & 관계 및 워크플로우 | Typed Embeddable, policy/getter, Relations, CoreEntity static API 및 전체 작업 절차 | `references/03_metadata_and_relations.md` |

---

## 🔄 워크플로우

1. **변경 대상 정의**:
   - 수정/추가 대상 테이블 및 엔티티 필드 스펙을 사전 분석함
2. **참조 파일 조회**:
   - 필드 타입에 맞는 규칙(`T | null`, `Opt<T>`, `Rel<T>`, `Date` 등)을 상기 참조 문서에서 확인함
3. **코드 작성**:
   - 엔티티(`*.entity.ts`)와 필요한 constants/policy 코드를 작성함
4. **산출물 및 타입 빌드**:
   - 루트에서 `pnpm db:build`를 실행하여 `metadata.json`, generated entity type, `dist/index.d.ts`를 갱신함
5. **검증**:
   - `coding-standard-guide` 스킬을 활용하여 영향 범위 내 의존성 타입체크 및 린트 오류를 해결함
