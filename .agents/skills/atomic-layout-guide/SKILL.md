---
name: atomic-layout-guide
description: React와 Tailwind CSS를 사용하여 반응형 블록 기반 UI를 구축하는 스킬입니다. 가로 배치는 Flexbox를, 세로 배치는 Grid(auto/1fr 조합)를 사용하는 일관된 레이아웃 규칙을 강제합니다. 사용자가 "화면 구성", "UI 컴포넌트 생성", "레이아웃 설계" 등을 요청할 때 이 스킬을 사용하세요.
---

# Atomic Layout Guide

이 스킬은 React와 Tailwind CSS를 활용하여 구조적으로 견고하고 스타일이 최적화된 프론트엔드 UI를 구축하기 위한 가이드라인입니다.

## 핵심 원칙

1. **React + Tailwind CSS 전용**: 모든 UI 컴포넌트는 React로 작성하며, 스타일링은 오직 Tailwind CSS 클래스만을 사용합니다.
2. **반응형 우선 (Mobile First)**: 기본 스타일은 모바일을 기준으로 작성하고, `md:`, `lg:` 등의 접두사를 사용하여 상위 브라우저 크기에 대응합니다.
3. **레이아웃 명시적 분리**:
    * **가로형 배치 (Horizontal)**: 반드시 `flex`를 사용합니다. 필요에 따라 `flex-row`, `items-center`, `justify-between`, `gap-*` 등을 활용하여 요소를 배치합니다.
    * **세로형 배치 (Vertical)**: 반드시 `grid`를 사용합니다. 특히 고정 영역과 가변 영역의 조합을 처리할 때 `grid-rows-[auto_1fr]` 또는 `grid-rows-[1fr_auto]` 형식을 권장합니다.
4. **블록 기반 구조**: UI를 독립적인 블록(Component) 단위로 생각하고 설계합니다. 각 블록은 자기 완결적이어야 하며, 재사용이 가능해야 합니다.
5. **스타일 최적화**:
    * 불필요하게 복잡한 중첩을 피합니다.
    * 일관된 간격(Spacing) 시스템(`m-*`, `p-*`, `gap-*`)을 사용합니다.
    * 의미 있는 컴포넌트 분할을 통해 Tailwind 클래스의 나열이 너무 길어지지 않게 관리합니다.

## 레이아웃 구현 가이드라인

### 1. 가로형 (Flex)

가로로 정렬되는 메뉴, 버튼 그룹, 카드 헤더 등은 Flexbox를 사용합니다.

```tsx
<div className="flex flex-row items-center justify-between gap-4">
  <Logo />
  <Navigation />
  <UserMenu />
</div>
```

### 2. 세로형 (Grid)

페이지 전체 레이아웃이나 사이드바 + 콘텐츠 영역, 헤더 + 메인 등 세로 구조는 Grid를 사용합니다. 특히 가변적인 본문 영역과 고정된 헤더/푸터를 다룰 때 아래 패턴을 유지합니다.

```tsx
// 상단 헤더(auto) + 본문 영역(1fr) 구조
<div className="grid grid-rows-[auto_1fr] h-screen">
  <header className="p-4 bg-gray-100">Header (Auto Height)</header>
  <main className="overflow-auto p-6">Main Content (Flexible Height)</main>
</div>
```

## 워크플로우

1. **요구사항 분석**: 사용자가 요청한 화면의 구조를 가로(Flex)와 세로(Grid) 블록으로 나눕니다.
2. **구조 설계**: 최상위 세로 레이아웃(Grid)부터 시작하여 내부 가로 요소(Flex) 순으로 컴포넌트를 설계합니다.
3. **코드 구현**: Tailwind 클래스를 사용하여 반응형 디자인을 적용합니다.
4. **최적화**: 코드를 깔끔하게 정리하고, 반복되는 스타일은 컴포넌트로 추출합니다.

## 주의 사항

* 세로 배치에 단순히 `flex flex-col`을 남용하지 말고, 명확한 영역 구분이 필요한 경우 `grid`를 우선적으로 고려하세요.
* 모든 인터랙티브 요소는 접근성(Accessibility)을 고려하여 ID와 Aria 레이블을 적절히 포함해야 합니다.
