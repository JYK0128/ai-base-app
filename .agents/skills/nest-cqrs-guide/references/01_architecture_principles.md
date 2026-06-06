# 핵심 아키텍처 원칙 (Core Architecture Principles)

- **1. 엄격한 파일 삼중 분리 (Three-File Decoupling)**
  - **DTO 분리 (`*.command.ts` / `*.query.ts`)**: 데이터 바인딩을 위한 무상태(Stateless) readonly DTO 클래스 구성
  - **예외 사전화 (`*.error.ts`)**: `defineErrors`를 통한 도메인 예외 사전화 및 `ExceptionGuard` 단언자 선언적 구현
  - **흐름 제어 (`*.handler.ts`)**: 의존성 주입(DI), 트랜잭션 격리, 비즈니스 흐름 조율을 담당하는 중추 핸들러 설계

- **2. 선언적 예외 처리 (Declarative Exceptions)**
  - **비즈니스 시인성**: 핸들러 내 전통적인 `throw new Exception` 직접 사용 배제를 통한 비즈니스 로직 시인성 확보
  - **단언자 패턴**: Asserter 메서드(`assert`, `throwIf`)를 활용한 예외 조건 검사 및 에러 발생의 통합 처리
  - **다국어 현지화**: 예외 응답 메시지 내 `ko`/`en` 쌍 필수 정의를 통한 글로벌 마이크로서비스 사양 준수

- **3. 단일 오케스트레이션 (Single Orchestration)**
  - **비선형 호출 금지**: 핵심 연산 프라이빗 메서드 간의 깊은 중첩 및 비선형적 연쇄 호출(Non-linear Chained Call) 전면 금지
  - **수평적 직접 배치**: 식별(Identify), 검증(Validate), 실행(Process) 단위를 `execute()` 내에 수평적(Flat)으로 나열
  - **단일 흐름 가시성**: 비즈니스 요건에 따라 전체 실행 흐름이 직관적으로 한눈에 파악되도록 설계
