# 코드 변경 워크플로우 세부 단계 (Workflow Steps)

- 본 워크플로우는 특정 프레임워크에 종속되지 않은 코드 변경 작업의 공통 표준 프로세스를 정의함
- 도메인 전용 스킬이 존재하는 경우 해당 규칙을 최우선 준수하고, 작업 절차는 본 스킬을 통해 보완함

---

## 0. 작업 이력 및 체크리스트 기록 (Workload Tracking)

- **작업 기록 활성화**: 코드 변경 요구사항을 받으면 실제 작업을 시작하기 전, 작업 체크리스트와 일정을 기록할 파일부터 생성함
- **기록 경로**: `.docs/_workload/YYYY-MM-DD/task-name.md`
  - `YYYY-MM-DD`는 현재 시작 일자 (예: `2026-06-13`)
  - `task-name`은 작업 성격을 대표하는 영문 소문자와 하이픈(-) 조합 (예: `refactor-member-invite`)
- **기록 템플릿**:

  ```markdown
  # [작업 요약 명칭] - YYYY-MM-DD

  ## 📋 작업 체크리스트

  - [ ] 세부 작업 내용 1
    - 시작: YYYY-MM-DD HH:MM
    - 완료: `[commit_hash]`
  - [ ] 세부 작업 내용 2
    - 시작: YYYY-MM-DD HH:MM
    - 완료: `[commit_hash]`
  ```

- **체크리스트 공백 규칙**: `## 📋 작업 체크리스트` 바로 아래에 빈 줄 1칸을 반드시 유지함
- **실시간 업데이트**: 각 세부 작업 시작 시 `시작` 일시를 기록하고, 작업이 완료되어 커밋을 생성한 후 `완료` 항목에 `commit hash`를 업데이트하고 체크박스(`[x]`)를 마킹함

---

## 1. 변경 범위 파악

- **검색 도구 활용**: 활성화된 편집기 화면 외에 `rg` 등을 사용하여 실제 참조 및 의존성을 정밀하게 검색함
- **계층 간 확인**: 여러 레이어에 걸쳐 유사한 성격의 타입, DTO, Enum, Generated Model이 중복 존재하는지 파악함
- **영향 범위 확장**: 특정 소스 수정 요청 시, 이와 연동되는 Helper, Handler, Controller, DTO, Contract, Token, Web 타입까지 종합적으로 모니터링함
- **작업 공간 신뢰**: dirty worktree 내 기존 수정 이력을 임의로 되돌리지 않고, 현재 상태에서 연속적으로 작업을 진행함
- **검색 템플릿**:

  ```bash
  rg -n "TargetName|oldField|newField" apps packages web
  rg --files | rg "target-name|domain"
  ```

---

## 2. 구현 원칙

- **단위화**: 변경 단위를 작게 유지하고, 기존 코드 컨벤션 및 구현 스타일을 준수함
- **Generated 코드 원본명 사용**: Generated API Model, Hook, Query Options, Zod Schema 등 생성된 코드가 제공하는 타입/함수/상수는 원본 이름 그대로 사용하고, 별칭(alias)으로 재명명하지 않음
- **Generated 코드 직접 수정 금지**: `web/**/api/generated/**`, `web/**/api/zod.ts`, OpenAPI 기반 산출물은 사람이 직접 내용 맞춤하지 않음. 서버 DTO/Controller/Contract/Response를 단일 신뢰 원천으로 수정한 뒤 생성 명령으로 갱신함
- **생성 명령 실패 시 중단**: API 생성 명령을 실행할 수 없거나 서버 기동이 불가능한 경우, generated 파일을 임시 수동 패치하지 않음. 현재까지의 서버 계약 변경, 실패 명령, 필요한 조치를 사용자에게 보고하고 다음 지시를 대기함
- **편집 도구**: 코드 수정 시 `replace_file_content` 또는 `multi_replace_file_content` 도구를 사용함
- **추상화 최소화**: 실제 반복 코드나 복잡도가 감소하는 조건에만 레이어 및 신규 추상화를 도입함
- **도메인 정합성**: 도메인 의미가 상이한 날짜/속성 필드는 개별 필드로 분리하여 유지함
- **캡슐화 지향**: 필요한 비즈니스 연산은 getter 또는 helper 함수로 한정하여 노출함
- **명명 규칙 정합성**: `*.contract.ts`는 메시지/페이로드 계약, `*.tokens.ts`는 DI 토큰, `*.helper.ts`는 순수 변환/유틸, `*.constants.ts`는 정말 공통 리터럴 상수에만 사용함
- **신뢰 체계 및 예외 처리 준수**: 타입 계약 및 데이터 보존 시 [최소 폴백 및 단일 신뢰 원천 가이드](file:///Users/server/Documents/GitHub/ai-base-app/.agents/skills/coding-standard-guide/references/03_minimal_fallback_and_trust.md)의 Fail-Fast 및 Source of Trust 원칙을 엄격히 적용함
- **잔여 참조 확인**: 필드명, Enum, API Response 스펙 변경 시 이전 이름이나 삭제 대상 참조가 남았는지 `rg`로 확인함

---

## 3. 검증 기준

- **적합성 검증**: 변경이 유발된 도메인 범위에 대응하여 빌드 및 린트 검증 명령을 수행함
- **API 계약 갱신 순서**: DTO, Swagger 응답, Controller query/response, Generated Model, Zod Schema 등 API 계약 변경 시 아래 순서를 체크리스트처럼 수행함
  - 서버 계약 수정: Controller, Contract, Request DTO, Response DTO, Handler 등록 수정함
  - 서버 검증: `platform-service` 타입체크와 관련 린트 통과 확인함
  - API 생성: 서버를 최신 상태로 띄운 뒤 API 생성 명령 실행함
  - 생성물 확인: `web/**/api/generated/**`, `web/**/api/zod.ts` diff가 서버 계약과 일치하는지 확인함
  - 웹 적용: 생성된 원본 이름 그대로 hook/type을 사용해 화면 코드를 수정함
  - 잔여 참조 검색: 이전 DTO/endpoint/hook/model 이름이 남았는지 `rg`로 확인함

  ```bash
  pnpm server:up
  pnpm gen:api
  ```

- **API 생성 명령 별칭**: 작업 환경에서 `api:gen` 별칭을 제공하는 경우 `pnpm gen:api` 대신 해당 별칭을 사용함
- **API 생성 불가 보고 규칙**: `pnpm server:up`, `pnpm gen:api`, 별칭 명령이 실패하거나 환경상 실행할 수 없는 경우 다음 형식으로 보고하고 generated 파일 수동 수정을 보류함

  ```markdown
  API 생성 보류
  - 서버 계약 변경: [파일 목록]
  - 실패 명령: `...`
  - 실패 이유: [로그 요약]
  - 필요한 조치: [서버 기동/환경변수/사용자 승인 등]
  ```
- **TanStack Router 라우트 생성 규칙**: `web/platform-admin-web/src/routes/**` 라우트 파일을 추가, 이동, 삭제한 경우 `web/platform-admin-web/src/routeTree.gen.ts`를 직접 편집하지 않고 라우트 생성 명령으로 갱신함

  ```bash
  pnpm gen:routes
  ```

- **라우트 생성 후 확인**: 생성 결과에 예상 경로가 반영되었는지 `rg`로 확인하고, 웹 타입검사를 수행함

  ```bash
  rg -n "target-route|TargetRoute" web/platform-admin-web/src/routeTree.gen.ts
  pnpm --filter=platform-admin-web exec tsc --noEmit
  ```

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

- **platform-service / Web API 계약 변경 시**:

  ```bash
  pnpm --filter=platform-service exec tsc -p tsconfig.app.json --noEmit
  pnpm --filter=platform-service lint
  pnpm --filter=platform-admin-web exec tsc --noEmit
  pnpm --filter=platform-admin-web lint
  ```

- **테스트 수행**: 단위 테스트가 작성된 영역은 관련 Vitest 테스트를 우선 실행하며, 검증 불가 사유 발생 시 최종 결과 보고에 명시함

---

## 4. 산출물 확인

- **빌드 아티팩트 검증**: Generated 파일 및 Build 아티팩트 변경 여부를 아래 주요 경로에서 검증함
  - ORM Metadata: `packages/database/src/metadata.json`
  - Database Dist Types: `packages/database/dist/index.d.ts`
  - API Generated Models & Zod Schemas: `web/platform-admin-web/src/api/**`
- **정합성 유지**: Swagger나 원격 개발 서버 기준 생성 파일 갱신 시, 현재 로컬 브랜치 코드와의 무결성을 사전에 확인함
- **수동 생성물 편집 감지**: `git diff -- web/**/api/generated web/**/api/zod.ts`에서 수동 패치 흔적이 있는 경우 최종 보고 전 생성 명령 산출물인지 확인함. 생성 명령으로 만든 변경이 아니면 되돌릴지 사용자에게 확인함

---

## 5. 최종 보고

- **보고서 규격**: 최종 작업 결과는 간결하고 핵심 위주의 개조식 구조로 기술함
  - 변경 핵심 내역
  - 작성 및 완료된 작업 이력 파일 경로 (예: `.docs/_workload/YYYY-MM-DD/something.md`)
  - 수정 및 추가된 핵심 파일 경로 (링크 포맷)
  - 검증 수행 내역 및 결과
  - 미실행된 검증이 존재할 시 구체적 사유
- **실용성 우선**: 복잡한 아키텍처나 설계 해설은 최소화하고, 사용자가 즉시 인지 및 검증할 수 있는 가시적 변경 정보 제공에 주력함

---

## 6. 스킬 업그레이드 및 개선 가이드

- **스킬 개선 필요성 정의**: 작업 진행 중 새로운 아키텍처 규칙이 추가되거나, 스타일 유틸리티가 변경되는 등 가이드라인의 최신화가 요구되는 시점을 식별함
- **사용자 승인 프로세스 준수**: 스킬 추가 및 변경 내용 적용 전, 변경 목적과 수정 예정 항목을 사용자에게 공유하여 반드시 사전 동의 및 승인을 획득함
- **`skill-creator` 활성화**: 사용자 승인 후, 각 가이드 스킬(`.agents/skills/*`)의 신규 작성, 구조 변경, 설명(Description) 및 Triggering 규칙 최적화 수행 시 `skill-creator` 스킬을 활용함
- **에발스(Evals) 테스트 적용**: 가이드 스킬의 정합성 검증 및 성능 평가를 위해 `evals/evals.json` 파일 내 시나리오를 추가하고 벤치마킹을 실행함
