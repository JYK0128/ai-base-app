# 포지셔닝 및 주의 사항 (Positioning & Precautions)

## 1. 포지셔닝 가이드라인

### 1.1. Relative + Sticky (부모 영역 내 고정)

- **용도**: 일반적인 페이지 레이아웃(헤더 등)에서 스크롤 시 상단 고정 목적
- **구성 요소**:
  - **부모 (`relative`)**: `sticky` 요소의 활동 범위 제한
  - **자식 (`sticky`)**: 실제 고정될 요소 (예: `top-0` 등의 오프셋 위치값 필수 지정)
- **예시 코드**:

  ```tsx
  <section className="scroll h-64 border">
    <header className="sticky top-0 bg-white p-2 border-b">
      Sticky Header
    </header>
    <div className="h-[1000px] p-4">Long Content...</div>
  </section>
  ```

### 1.2. Relative + Absolute (컨테이너 기준 절대 위치)

- **용도**: 배지, 아이콘, 툴팁 등 부모 요소의 특정 위치에 종속되어 표시되는 컴포넌트
- **예시 코드**:

  ```tsx
  <div className="relative w-20 h-20 bg-gray-100">
    <span className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs">
      Badge
    </span>
  </div>
  ```

### 1.3. Fixed (모달 및 오버레이 전용)

- **용도**: 뷰포트 전체를 기준으로 배치되는 **모달, 다이얼로그, 토스트** 오버레이
- **예시 코드**:

  ```tsx
  <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-xl">
      Modal Content
    </div>
  </div>
  ```

---

## 2. 주의 사항

- **Fixed 사용 자제**: 헤더/푸터 고정 시 `fixed` 대신 `grid` 레이아웃 구조 또는 `relative + sticky` 포지셔닝을 우선 고려함
- **Sticky 작동 제약**: `sticky`가 동작하지 않을 경우 부모 엘리먼트에 `overflow: hidden` 계열 속성이 지정되어 동작을 방해하는지 확인함
- **기준점 설정**: `absolute` 사용 시 기준점이 될 상위 부모 요소에 `relative` 속성이 정의되어 있는지 확인함
- **접근성 준수**: 웹 접근성 향상을 위해 모든 인터랙티브 요소에는 고유 ID 및 ARIA 레이블을 반드시 포함함
