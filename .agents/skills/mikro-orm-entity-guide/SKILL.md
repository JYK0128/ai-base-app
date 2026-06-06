---
name: mikro-orm-entity-guide
description: MikroORM 엔티티 작성 및 수정 가이드. CoreEntity 상속, Repository 패턴, Opt 기반 optional create payload 처리, typed metadata/embeddable 구조, Date/Enum 필드 규칙 및 metadata 재생성 강제. 엔티티/테이블/데코레이터 관련 변경 요청 시 필수 사용.
---

# MikroORM Entity Guide

- `packages/database` 내 MikroORM 엔티티를 일관성 있게 생성 및 수정하기 위한 개발 규칙 정의
- 엔티티 수정 시 downstream service, gateway DTO, web generated model에 영향을 주므로 소스 코드, ORM metadata, dist 타입, 타입체크를 함께 검증함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 규칙 및 구현 코드: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🏛️ 1. 기본 원칙 & 파일 구조 | CoreEntity 상속, 파일명 규칙, 폴더 구조 및 Imports | `references/01_basics_and_file_structure.md` |
| 🗂️ 2. 필드 선언 규칙 | scalar 타입 및 Enum 선언 규칙, CoreEntity 필드 관리, Date 필드 정의 규칙 | `references/02_field_declarations.md` |
| 🛠️ 3. 메타데이터 & 관계 및 워크플로우 | Typed Embeddable, Getter/Setter 제한, Relations 정의, Repository 설정 및 전체 작업 절차 | `references/03_metadata_and_relations.md` |

---

## 🔄 워크플로우

1. **변경 대상 정의**:
   - 수정/추가 대상 테이블 및 엔티티 필드 스펙을 사전 분석함
2. **참조 파일 조회**:
   - 필드 타입에 맞는 규칙(`Opt<T>` 사용 여부, `Date` 필드 기준 등)을 상기 참조 문서에서 확인함
3. **코드 작성**:
   - 엔티티(`*.entity.ts`) 및 리포지토리(`*.repository.ts`) 코드를 작성함
4. **산출물 및 타입 빌드**:
   - `packages/database` 디렉토리에서 `@pkg/database build`를 실행하여 `metadata.json` 및 `dist/index.d.ts`를 최신으로 갱신함
5. **검증**:
   - `coding-change-workflow` 스킬을 활용하여 영향 범위 내 의존성 타입체크 및 린트 오류를 해결함
