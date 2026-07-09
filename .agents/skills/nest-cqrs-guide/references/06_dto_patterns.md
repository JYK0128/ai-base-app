# CQRS DTO 패턴

NestJS CQRS 유스케이스에서 request/response DTO, nested DTO, sort DTO를 작성할 때의 공통 규칙이다.

---

## 1. request DTO

- `Create`는 필수 입력 중심으로 작성한다.
- `Update`는 `Create`의 optional 버전으로 본다.
- `List`는 `filters`를 nested DTO로 분리하고 `toFilterQuery()`를 갖는다.
- `Page` / `Cursor`는 pagination 메타와 `sort`/`direction`을 분리한다.
- `ApiPropertyOptional`은 선택 입력에만 사용한다.
- `| null` 타입이면 `nullable: true`를 반영한다.
- enum은 `type` 없이 `enum`만 둔다.
- 스칼라 필드는 `example / type / isArray / nullable / description` 순서를 지킨다.
- DTO 필드는 `type / isArray / nullable / description` 순서를 지킨다.

---

## 2. response DTO

- `ApiProperty`를 사용한다.
- `example`은 쓰지 않는다.
- `nullable: true`는 실제 타입의 `| null`과 일치시킨다.
- enum은 `type` 없이 `enum`만 둔다.
- list response는 `items` 중심으로, page response는 pagination 메타를 함께 명시한다.

---

## 3. sort DTO

- sort는 일반 update가 아니라 별도 재정렬 command로 취급한다.
- 바깥 DTO는 `items` 배열을 필수로 받는다.
- `SortItemDto`는 `id`, `sortOrder` 같은 핵심 값을 필수로 둔다.
- nullable 필드는 `key`는 required로 두고 값만 `null` 허용으로 표현한다.
- `optional`은 payload 자체가 그 필드를 생략할 수 있을 때만 사용한다.
- nullable 값을 허용하는 필드는 `@ApiProperty({ nullable: true })`와 함께 `ValidateIf((_, value) => value !== null)` 같은 검증을 사용한다.

---

## 4. contract 연결

- `Command<TResponse>` / `Query<TResponse>`는 request DTO를 `data`로 감싼다.
- controller는 request DTO를 받고 contract를 생성한다.
- handler는 contract의 `data`를 기준으로 `identify - verify - process` 흐름을 유지한다.

---

## 5. CRUD 표현 차이

- `Create`
  - 필수 입력 중심이다.
  - `ApiProperty`를 기본으로 쓰고 `example`을 포함한다.
  - `nullable`은 실제 허용값일 때만 둔다.
- `Update`
  - `Create`의 optional 버전이다.
  - `ApiPropertyOptional`을 기본으로 쓰고 `example`을 포함한다.
  - request body에서는 `id`를 포함하는 구조와 path param으로 받는 구조를 분리해서 본다.
- `List`
  - `filters` / `sort` / `direction` / `offset` / `limit`로 분리한다.
  - filter는 nested DTO로 빼고 `toFilterQuery()`를 둔다.
- `Page`
  - list와 비슷하지만 `page`, `totalPages`, `totalCount`, `hasNextPage`, `hasPrevPage` 같은 메타가 추가된다.
- `GetOne` / `Detail`
  - entity projection에 가깝다.
  - `EntityResponseType` 기반으로 응답 필드를 덮어쓴다.
- `Sort`
  - update와 다르게 재배치 전용이다.
  - `items[]` 구조를 사용하고 `SortItemDto`는 내부에서 required 필드를 유지한다.
