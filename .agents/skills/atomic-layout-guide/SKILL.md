---
name: atomic-layout-guide
description: React와 Tailwind CSS를 사용하여 반응형 블록 기반 UI를 구축하는 스킬입니다. 레이아웃(Grid/Flex)과 포지셔닝(Sticky/Absolute/Fixed)의 명확한 선택 기준을 제시하며, 구조적이고 예측 가능한 프론트엔드 아키텍처 구축을 강제합니다.
---

# Atomic Layout Guide

이 가이드는 React와 Tailwind CSS를 사용하여 유지보수가 용이하고 시각적으로 일관된 UI를 구축하기 위한 레이아웃 및 포지셔닝 규칙을 정의합니다.

## 핵심 원칙

1. **역할의 명확한 분리**:
    * **레이아웃 (Layout)**: `grid` 또는 `flex`를 사용하여 요소의 구역과 흐름을 정의합니다.
    * **포지셔닝 (Positioning)**: `sticky`, `absolute`, `fixed`를 사용하여 특정 컨텍스트 내의 위치를 제어합니다.
2. **구조적 우선순위**: 세로(Vertical) 구조는 `grid`, 가로(Horizontal) 구조는 `flex` 사용을 원칙으로 합니다.
3. **반응형 우선 (Mobile First)**: 기본 클래스는 모바일에 맞추고, `md:`, `lg:` 접두사로 확장합니다.

---

## 1. 레이아웃 가이드라인

### 가로 배치 (Flex)

메뉴 바, 버튼 그룹 등 가로로 나열되는 요소에 사용합니다.

```tsx
<div className="flex items-center justify-between gap-4">
  <Logo />
  <Navigation />
  <UserMenu />
</div>
```

### 세로 배치 및 전체 골격 (Grid)

페이지의 전체 구조나 고정/가변 영역이 공존하는 세로 배치에 사용합니다.

```tsx
/* 상단 헤더(auto) + 본문(1fr) + 하단 푸터(auto) 구조 */
<div className="grid grid-rows-[auto_1fr_auto] h-screen">
  <header className="p-4 bg-gray-50">Header</header>
  <main className="overflow-auto p-6">Main Content</main>
  <footer className="p-4 bg-gray-50">Footer</footer>
</div>
```

---

## 2. 포지셔닝 가이드라인

### Relative + Sticky (부모 영역 내 고정)

일반적인 페이지 레이아웃(헤더 등)에서 스크롤 시 상단에 고정하기 위해 사용합니다.

* **부모(`relative`)**: `sticky` 요소의 활동 범위를 제한합니다.
* **자식(`sticky`)**: 실제 고정될 요소이며, `top-0` 등 위치값이 필수입니다.

```tsx
<section className="relative h-64 overflow-auto border">
  <header className="sticky top-0 bg-white p-2 border-b">
    Sticky Header
  </header>
  <div className="h-[1000px] p-4">Long Content...</div>
</section>
```

### Relative + Absolute (컨테이너 기준 절대 위치)

배지, 아이콘, 툴팁 등 부모 요소의 특정 위치에 덧붙이는 요소에 사용합니다.

```tsx
<div className="relative w-20 h-20 bg-gray-100">
  <span className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs">
    Badge
  </span>
</div>
```

### Fixed (모달 및 오버레이 전용)

뷰포트 전체를 기준으로 하는 **모달, 다이얼로그, 토스트** 등에만 제한적으로 사용합니다.

```tsx
<div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
  <div className="bg-white p-6 rounded shadow-xl">
    Modal Content
  </div>
</div>
```

---

## 주의 사항

* **Fixed 사용 자제**: 헤더나 푸터 고정 시 `fixed` 대신 `grid` 레이아웃 설계나 `relative + sticky` 포지셔닝을 우선적으로 사용하세요.
* **Sticky 제약**: `sticky`가 작동하지 않는다면 부모 요소에 `overflow: hidden`이 적용되어 있는지 확인하세요.
* **기준점 확인**: `absolute` 사용 시 반드시 의도한 부모가 `relative`를 가지고 있는지 확인하세요.
* **접근성**: 모든 인터랙티브 요소는 접근성을 위해 고유 ID와 Aria 레이블을 포함해야 합니다.
