# 인터페이스 표준

## 1. HTTP 기본 규격

- JSON UTF-8 REST API를 사용함
- 전역 prefix는 `/api`를 사용함
- URI 버저닝으로 `/api/v1/...` 경로를 구성함
- health endpoint는 전역 prefix와 버저닝에서 분리한 `/health/live`, `/health/ready`를 사용함

## 2. 인증·보안 헤더와 쿠키

- 인증 상태는 Redis-backed session cookie로 전달함
- 상태 변경 요청은 `x-csrf-token` 헤더를 전달함
- 클라이언트가 전달한 `x-trace-id`는 동일 추적 흐름에 사용함
- 서버가 생성한 `x-request-id`는 단일 HTTP 요청 식별에 사용함
- `Accept-Language`는 오류 메시지와 다국어 컨텍스트 결정에 사용함

## 3. 표준 응답 Envelope

- 공통 필드
  - `success`: 성공 여부
  - `data`: 성공 데이터 또는 `null`
  - `error`: 오류 정보 또는 `null`
  - `message`: 대표 메시지 또는 `null`
  - `traceId`: 분산 추적 식별자 또는 `null`
  - `requestId`: 요청 식별자 또는 `null`
- 성공 예시

  ```json
  {
    "success": true,
    "data": { "id": "019e5236-adae-70d7-a8f7-2dc90bdf7082" },
    "error": null,
    "message": null,
    "traceId": "trace-id",
    "requestId": "request-id"
  }
  ```

- 실패 예시

  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "리소스를 찾을 수 없습니다.",
      "details": null,
      "status": 404
    },
    "message": "리소스를 찾을 수 없습니다.",
    "traceId": "trace-id",
    "requestId": "request-id"
  }
  ```

## 4. 공통 요청 계약

- 식별자: `IdRequestDto`, `IdListRequestDto`
- 엔티티 파생 입력: `EntityRequestType(Entity)`
- 임의 payload: `PayloadRequestDto`
- 목록: `ListRequestDto`
- 페이지: `PageRequestDto`
- 커서: `CursorRequestDto`
- 정렬·필터 공통 타입: `SortableRequestDto`, `FilterableRequestDto`

## 5. 공통 응답 계약

- 식별자: `IdResponseDto`, `IdListResponseDto`
- 엔티티 파생 응답: `EntityResponseType(Entity)`
- 목록: `ListResponseDto`
- 페이지: `PageResponseDto`
- 커서: `CursorResponseDto`
- 임의 payload: `PayloadResponseDto`
- 변경 행 수: `AffectedRowsResponseDto`

## 6. 목록 응답 네이밍

- page row DTO는 `<Domain>PageItem` 또는 피처 의미가 필요한 `<Feature>PageItem`으로 명명함
- list row DTO는 `<Domain>ListItem` 또는 피처 의미가 필요한 `<Feature>ListItem`으로 명명함
- wrapper는 `Get<Domain>PageResponseDto`, `Get<Domain>ListResponseDto` 형태를 사용함
- 단건 detail 응답은 `Get<Domain>ResponseDto` 형태를 사용함
- row DTO는 `EntityResponseType(Entity)`를 확장하고 외부 노출 필드에 Swagger 데코레이터를 선언함

## 7. OpenAPI 생성 흐름

- Controller, Contract, Request DTO, Response DTO를 서버 계약의 신뢰 원천으로 사용함
- 서버 타입검사와 린트 완료 후 최신 서버를 실행함
- `pnpm gen:api`로 웹 endpoint, model, Zod schema를 생성함
- 생성 diff와 서버 계약의 nullable, enum, status code를 대조함
