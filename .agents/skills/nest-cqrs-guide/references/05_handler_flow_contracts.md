# 핸들러 단계 규칙

## 목적

- CQRS의 `command` / `query` 두 축에 맞춰 `identify - verify - process` 의미를 고정한다
- query에서 `process`는 메인 조회와 DTO wrapping을 함께 담당하도록 한다
- command/query 인자와 식별된 의존성을 `process(command/query, identified...)` 순서로 유지한다

## 공통 규칙

| 단계 | 규칙 |
| --- | --- |
| identify | 요청 컨텍스트, 선행 대상, 조회 전 필요한 상태를 확보한다 |
| verify | 정책, 정합성, 권한, 제약 조건을 확인한다 |
| process | command에서는 상태 변경/외부 효과, query에서는 메인 조회와 DTO wrapping을 수행한다 |

## command

- `identify`는 대상 확보와 실행 전 상태를 모은다
- `verify`는 변이 가능 여부와 정책을 확인한다
- `process`는 상태 변경, 저장, 이벤트/메일/외부 호출을 수행한다
- `process` 시그니처는 `process(command, identified...)` 순서를 따른다

## query

- `identify`는 조회 전에 필요한 컨텍스트만 확보한다
- `verify`는 조회 정책과 정합성을 확인한다
- `process`는 메인 데이터를 조회하고 response DTO를 조립한다
- `process` 시그니처는 `process(query, identified...)` 순서를 따른다

## 작성 기준

- query handler에서 메인 조회는 `process`에 둔다
- command/query 모두 `process`에 primitive 인자를 쪼개서 넘기지 않는다
- query handler는 조회 결과를 직접 response DTO로 감싼다
- `verify*`를 사용한다
