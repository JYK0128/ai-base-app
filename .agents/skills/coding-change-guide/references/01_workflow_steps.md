# 코드 변경 워크플로우 세부 단계 (Workflow Steps)

- 본 워크플로우는 특정 프레임워크에 종속되지 않은 코드 변경 작업의 공통 표준 프로세스를 정의함
- 도메인 전용 스킬이 존재하는 경우 해당 규칙을 최우선 준수하고, 작업 절차는 본 스킬을 통해 보완함

---

## 1. 변경 범위 파악

- **검색 도구 활용**: 활성화된 편집기 화면 외에 `rg` 등을 사용하여 실제 참조 및 의존성을 정밀하게 검색함
- **계층 간 확인**: 여러 레이어에 걸쳐 유사한 성격의 타입, DTO, Enum, Generated Model이 중복 존재하는지 파악함
- **영향 범위 확장**: 특정 소스 수정 요청 시, 이와 연동되는 Mapper, Handler, Controller, DTO, Web 타입까지 종합적으로 모니터링함
- **작업 공간 신뢰**: dirty worktree 내 기존 수정 이력을 임의로 되돌리지 않고, 현재 상태에서 연속적으로 작업을 진행함
- **검색 템플릿**:

  ```bash
  rg -n "TargetName|oldField|newField" apps packages web
  rg --files | rg "target-name|domain"
  ```

---

## 2. 구현 원칙

- **단위화**: 변경 단위를 작게 유지하고, 기존 코드 컨벤션 및 구현 스타일을 준수함
- **편집 도구**: 코드 수정 시 `replace_file_content` 또는 `multi_replace_file_content` 도구를 사용함
- **추상화 지양**: 불필요한 레이어나 신규 추상화 도입을 지양하고, 실제 반복 코드나 복잡도가 감소하는 경우에만 도입함
- **도메인 정합성**: 도메인 의미가 상이한 날짜/속성 필드들을 인위적으로 통합하지 않음
- **캡슐화 지향**: setter 및 우회 proxy의 무분별한 사용을 배제하고, 필요한 비즈니스 연산만 getter 또는 mapper 함수로 한정하여 노출함

---

## 3. 영향 범위 정리

- **체크리스트**: 코드 수정 완료 후 아래 대상 중 영향 범위에 해당하는 항목이 있는지 종합 진단함
  - Database Entity, Schema, Metadata
  - Service Mapper, Command/Query Handler, Controller
  - Gateway DTO, Validation Decorator, Swagger Response
  - Web Generated API Model, Zod Schema, UI 컴포넌트
  - Test Code, Fixtures, Seed, Mock 데이터
  - Build Output, Generated Artifacts
- **잔여 참조 검증**: 필드명, Enum, API Response 스펙 변경 시 잔여 참조가 없는지 검색을 수행함

  ```bash
  rg -n "removedField|OldStatus|OldDto" apps packages web
  ```

---

## 4. 검증 기준

- **적합성 검증**: 변경이 유발된 도메인 범위에 대응하여 빌드 및 린트 검증 명령을 수행함
- **단일 패키지 변경 시**:

  ```bash
  pnpm --filter=<package> exec tsc -p tsconfig.app.json --noEmit
  pnpm --filter=<package> lint
  ```

- **Database Entity 변경 시**:

  ```bash
  pnpm --filter=@pkg/database build
  pnpm --filter=@pkg/database exec tsc -p tsconfig.app.json --noEmit
  pnpm --filter=@pkg/database lint
  ```

- **Core / Gateway / Web API 계약 변경 시**:

  ```bash
  pnpm --filter=platform-core-service exec tsc -p tsconfig.app.json --noEmit
  pnpm --filter=platform-core-service lint
  pnpm --filter=platform-gateway exec tsc -p tsconfig.app.json --noEmit
  pnpm --filter=platform-gateway lint
  pnpm --filter=platform-admin-web exec tsc --noEmit
  pnpm --filter=platform-admin-web lint
  ```

- **테스트 수행**: 단위 테스트가 작성된 영역은 관련 Vitest 테스트를 우선 실행하며, 검증 불가 사유 발생 시 최종 결과 보고에 명시함

---

## 5. 산출물 확인

- **빌드 아티팩트 검증**: Generated 파일 및 Build 아티팩트 변경 여부를 아래 주요 경로에서 검증함
  - ORM Metadata: `packages/database/src/metadata.json`
  - Database Dist Types: `packages/database/dist/index.d.ts`
  - API Generated Models & Zod Schemas: `web/platform-admin-web/src/api/**`
- **정합성 유지**: Swagger나 원격 개발 서버 기준 생성 파일 갱신 시, 현재 로컬 브랜치 코드와의 무결성을 사전에 확인함

---

## 6. 최종 보고

- **보고서 규격**: 최종 작업 결과는 간결하고 핵심 위주의 개조식 구조로 기술함
  - 변경 핵심 내역
  - 수정 및 추가된 핵심 파일 경로 (링크 포맷)
  - 검증 수행 내역 및 결과
  - 미실행된 검증이 존재할 시 구체적 사유
- **실용성 우선**: 복잡한 아키텍처나 설계 해설은 최소화하고, 사용자가 즉시 인지 및 검증할 수 있는 가시적 변경 정보 제공에 주력함

---

## 7. 스킬 업그레이드 및 개선 가이드

- **스킬 개선 필요성 정의**: 작업 진행 중 새로운 아키텍처 규칙이 추가되거나, 스타일 유틸리티가 변경되는 등 가이드라인의 최신화가 요구되는 시점을 식별함
- **사용자 승인 프로세스 준수**: 스킬 추가 및 변경 내용 적용 전, 변경 목적과 수정 예정 항목을 사용자에게 공유하여 반드시 사전 동의 및 승인을 획득함
- **`skill-creator` 활성화**: 사용자 승인 후, 각 가이드 스킬(`.agents/skills/*`)의 신규 작성, 구조 변경, 설명(Description) 및 Triggering 규칙 최적화 수행 시 `skill-creator` 스킬을 활용함
- **에발스(Evals) 테스트 적용**: 가이드 스킬의 정합성 검증 및 성능 평가를 위해 `evals/evals.json` 파일 내 시나리오를 추가하고 벤치마킹을 실행함
