# 레이아웃 가이드라인 (Layout Guidelines)

## 1. 핵심 원칙

- **역할의 명확한 분리**:
  - **레이아웃 (Layout)**: `grid` 또는 `flex`를 사용하여 요소의 구역 및 흐름 정의
  - **포지셔닝 (Positioning)**: `sticky`, `absolute`, `fixed`를 사용하여 특정 컨텍스트 내 위치 제어
- **구조적 우선순위**:
  - 세로(Vertical) 구조: `grid` 사용을 원칙으로 함
  - 가로(Horizontal) 구조: `flex` 사용을 원칙으로 함
- **반응형 우선 (Mobile First)**:
  - 기본 클래스를 모바일 기준으로 설계한 후, `md:`, `lg:` 접두사로 확장함

---

## 2. 레이아웃 가이드라인

### 2.1. 가로 배치 (Flex)

- **적용 대상**: 메뉴 바, 버튼 그룹 등 가로 방향으로 나열되는 요소
- **예시 코드**:

  ```tsx
  <div className="flex items-center justify-between gap-4">
    <Logo />
    <Navigation />
    <UserMenu />
  </div>
  ```

### 2.2. 세로 배치 및 전체 골격 (Grid)

- **적용 대상**: 페이지 전체 레이아웃 구조, 혹은 고정 및 가변 높이 영역이 공존하는 세로 배치 구조
- **특징**: 본문 영역이 가용 높이를 동적으로 채우도록 유도하여 내부 스크롤 공간을 안정적으로 확보함
- **예시 코드**:

  ```tsx
  <div className="grid grid-rows-[auto_1fr_auto] h-screen">
    <header className="p-4 bg-gray-50">Header</header>
    <main className="scroll p-6">Main Content</main>
    <footer className="p-4 bg-gray-50">Footer</footer>
  </div>
  ```
