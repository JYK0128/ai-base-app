# 스크롤 유틸리티 가이드라인 (Scroll Utility Guidelines)

- 프로젝트 내 스크롤 동작 표준화 및 레이아웃 무결성 보장을 위해 커스텀 Tailwind CSS v4 스크롤 유틸리티(`scroll`, `scroll-y`, `scroll-x`) 사용을 정의함

---

## 1. 핵심 설계 배경 및 철학

Tailwind CSS의 `overflow-auto` 또는 `overflow-y-auto`를 사용할 때 발생할 수 있는 레이아웃 결함을 커스텀 유틸리티를 통해 해결함:

1. **absolute/sticky 탈출**: 스크롤 컨테이너 내 `absolute` 자식 요소 및 `sticky` 헤더가 컨테이너 경계를 이탈함
2. **flex 아이템 축소 실패**: 중첩 flexbox 내 `min-h-0` / `min-w-0` 미지정으로 인해 컨테이너 크기가 부모 범위를 초과함
3. **오버스크롤 체이닝**: 스크롤 한계 지점 도달 시 부모 엘리먼트 또는 윈도우 스크롤이 트리거됨
4. **모바일 웹킷 터치 스크롤 누락**: iOS/macOS Safari 환경에서 모멘텀(Momentum) 스크롤링이 비활성화됨

---

## 2. 유틸리티 정의 상세 (`packages/ui/src/index.css`)

### 2.1. `scroll` (양방향 스크롤)

- **적용 대상**: 가로/세로 방향 모두 유동적으로 스크롤바가 생성되어야 하는 컨테이너
- **적용 스타일**:

  ```css
  @utility scroll {
    @apply relative!;           /* absolute/sticky 자식 요소의 포지셔닝 컨텍스트 강제 */
    @apply min-w-0! min-h-0!;    /* flexbox 내 레이아웃 무결성 유지 (축소 실패 방지) */
    @apply overflow-auto!;      /* 필요 시에만 스크롤바 표시 */
    @apply overscroll-contain!; /* 오버스크롤 체이닝 방지 */

    -webkit-overflow-scrolling: touch !important; /* iOS 모멘텀 스크롤 지원 */
  }
  ```

### 2.2. `scroll-y` (세로 전용 스크롤)

- **적용 대상**: 세로 방향 스크롤만 허용하고 가로 스크롤은 제한하는 목록, 모달 본문 등
- **적용 스타일**:

  ```css
  @utility scroll-y {
    @apply relative!;
    @apply min-h-0!;
    @apply overflow-y-auto! overflow-x-hidden!;
    @apply overscroll-y-contain!;

    -webkit-overflow-scrolling: touch !important;
  }
  ```

### 2.3. `scroll-x` (가로 전용 스크롤)

- **적용 대상**: 가로 탭 메뉴, 가로 카드 리스트, 테이블 반응형 래퍼 등
- **적용 스타일**:

  ```css
  @utility scroll-x {
    @apply relative!;
    @apply min-w-0!;
    @apply overflow-x-auto! overflow-y-hidden!;
    @apply overscroll-x-contain!;

    -webkit-overflow-scrolling: touch !important;
  }
  ```

---

## 3. 사용 가이드 및 규칙

### 3.1. 커스텀 스크롤 유틸리티 적용

- 모든 스크롤 컨테이너는 커스텀 스크롤 유틸리티(`scroll`, `scroll-y`, `scroll-x`)를 사용하여 일관된 스크롤바 및 레이아웃을 구현함
- **작성 형태**:
  - `className="flex-1 scroll-y"`

### 3.2. 스크롤 발생 조건 보장

- 부모 flex 컨테이너에 `overflow-hidden` 또는 고정 높이/너비(`h-screen`, `h-[85vh]` 등) 지정 필수
- 스크롤 대상 flex 자식 요소에 `flex-1` 등 유연한 팽창 지시어 적용 권장

---

## 4. 리팩토링 규칙

- 기존 코드에서 발견되는 `overflow-y-auto`, `overflow-auto`, `overflow-x-auto` 패턴을 `scroll-*` 클래스로 교체하여 통일성 있게 관리함
- 중복 정의된 `relative`, `min-h-0` 등은 제거하여 단순화함
  - **교체 예시**: `relative min-h-0 overflow-y-auto pr-0.5` ➡️ `scroll-y pr-0.5`
