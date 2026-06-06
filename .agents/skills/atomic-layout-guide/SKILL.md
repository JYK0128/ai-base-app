---
name: atomic-layout-guide
description: React/Tailwind CSS 기반 반응형 블록 UI 구축 스킬. 레이아웃(Grid/Flex), 포지셔닝(Sticky/Absolute/Fixed), 스크롤 커스텀 유틸리티(scroll/scroll-y/scroll-x) 선택 기준 및 적용 규칙 제시. 스크롤, overflow, 스크롤바, 레이아웃 설계 관련 요구사항 발생 시 필수 사용.
---

# Atomic Layout Guide

- React 및 Tailwind CSS 기반의 유지보수가 용이하고 시각적으로 일관된 UI 구축을 위한 레이아웃/포지셔닝 규칙 정의
- 실제 코드 수정, 영향 범위 확인, 타입체크/린트/빌드 검증 시 `coding-change-workflow` 스킬을 함께 적용함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 레이아웃 및 포지셔닝 구현 코드: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 📐 1. 레이아웃 가이드라인 | 핵심 설계 원칙(역할 분리, 구조 우선순위, Mobile First) 및 가로 배치(Flex), 세로 배치(Grid) 규칙 | `references/01_layout_guidelines.md` |
| 📍 2. 포지셔닝 및 주의사항 | Relative+Sticky, Relative+Absolute, Fixed(모달/토스트) 용도 설정 및 레이아웃 설계 주의사항 | `references/02_positioning_and_precautions.md` |
| 📜 3. 스크롤 유틸리티 가이드라인 | 일관된 스크롤 동작을 보장하기 위한 `scroll`, `scroll-y`, `scroll-x` 커스텀 유틸리티 클래스의 용도 및 리팩토링 규칙 | `references/03_scroll_utility_guidelines.md` |

---

## 🔄 워크플로우

1. **디자인 요건 확인**:
   - 구현 대상 UI가 레이아웃(배치 및 구조)인지 포지셔닝(위치 제어)인지, 혹은 내부 스크롤 영역인지 분류함
2. **구조 설계 및 규칙 준수**:
   - 세로는 `grid`, 가로는 `flex`를 기본으로 설정함
   - 헤더/푸터 등은 `sticky`나 `grid` 구조를 우선시하여 고정 위치를 구현함
   - 스크롤 영역에는 커스텀 스크롤 유틸리티인 `scroll`, `scroll-y`, `scroll-x`를 사용하여 스타일을 일관되게 관리함
3. **코드 구현**:
   - `references/01_layout_guidelines.md`, `references/02_positioning_and_precautions.md`, `references/03_scroll_utility_guidelines.md`에서 세부 마크업 형태를 확인하여 구현함
4. **검증**:
   - `coding-change-workflow`를 적용하여 린트 및 빌드 검증을 완료함
