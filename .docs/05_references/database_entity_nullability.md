# 데이터베이스 엔티티 Nullability 기준

## 1. 기준 목적

- `packages/database`의 scalar, relation, embeddable 필드 표기를 통일함
- DB의 값 부재와 생성 payload의 생략 가능성을 각각 명시함
- 엔티티, DTO, OpenAPI 생성 모델의 nullable 의미를 일관되게 전달함

## 2. 저장 필드 표기

- 필수 저장 필드
  - 데코레이터에 `nullable`을 지정하지 않음
  - 생성 시 값이 필요한 필드는 `field!: T`로 선언함
- nullable 저장 필드
  - 데코레이터에 `{ nullable: true }`를 지정함
  - TypeScript는 `field: T | null = null`로 선언함
  - 값 부재를 DB와 런타임에서 `null`로 통일함
- 기본값이 있는 필드
  - `field: Opt<T> = defaultValue`로 선언함
  - `Opt<T>`는 MikroORM create payload에서 생략 가능한 필드를 표현함
- 컬렉션 관계
  - `new Collection<T>(this)`로 즉시 초기화함

## 3. 관계 필드 표기

- 필수 관계는 `field!: Rel<T>`로 선언함
- nullable 관계는 데코레이터의 `{ nullable: true }`와 `field: Rel<T> | null = null`을 함께 사용함
- relation ID 입력은 `EntityRequestType`이 `string | null` 의미로 변환함
- API DTO는 실제 외부 계약에 맞춰 `@ApiProperty`의 `nullable`을 명시함

## 4. CoreEntity 공통 필드

- 필수·기본값 필드: `id`, `createdAt`
- nullable 감사 필드: `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`
- nullable 공통 metadata: `metadata`
- 파생 필드: `isDeleted`

## 5. 현재 적용 예시

- scalar: `MemberInvite.note: string | null = null`
- scalar: `Resource.sortOrder: number | null = null`
- relation: `Resource.parent: Rel<Resource> | null = null`
- embeddable: `AnnouncementMetadata.publishedAt: Date | null = null`
- embeddable: `MemberInviteMetadata.sentAt: Date | null = null`
- embeddable: `OrganizationMetadata.approvedAt: Date | null = null`
- embeddable: `TermsDocumentMetadata.terminatedAt: Date | null = null`
- default: `Resource.scope: Opt<ResourceScope> = ResourceScope.PLATFORM`
- default: `Resource.creatable: Opt<boolean> = false`

## 6. DTO 전파 규칙

- `EntityRequestType(Entity)`는 엔티티 필드를 선택 입력으로 변환함
- nullable scalar와 relation은 request type에서도 `null`을 유지함
- `EntityResponseType(Entity)`는 필수 응답 필드 구조를 파생함
- Date 응답은 직렬화 경계를 고려해 `Date | null` 계약을 제공함
- 피처 DTO는 파생 타입을 확장하고 노출 필드와 Swagger metadata를 명시함

## 7. 검증 절차

- `pnpm db:build`로 `metadata.json`, generated entity type, `dist/index.d.ts`를 갱신함
- `pnpm --filter=@pkg/database exec tsc -p tsconfig.app.json --noEmit`로 타입을 검사함
- `pnpm --filter=@pkg/database lint`로 정적 분석을 수행함
- API 노출 필드 변경 시 `platform-service`를 검증하고 `pnpm gen:api`로 웹 생성물을 갱신함
- `rg -n "\\?:|nullable: true|\\| null" packages/database/src/domains`로 잔여 표기를 대조함

## 8. 관련 작업 기록

- [엔티티 optional/null 점검](../_workload/2026-07-07/entity-optional-null-audit.md)
- [엔티티 nullable 필드 표준화](../_workload/2026-07-07/entity-nullable-field-standardization.md)
