# Response class 전환 계획 - 2026-06-27

## 📋 작업 체크리스트

- [ ] 현재 Request/Response DTO 구조 및 참조 범위 검토 | 시작: 2026-06-27 00:00 | 완료: `미완료`
- [ ] Response 공통 타입 class 전환 범위 확정 | 시작: 2026-06-27 00:00 | 완료: `미완료`
- [ ] 도메인별 response DTO 영향 범위 정리 | 시작: 2026-06-27 00:00 | 완료: `미완료`
- [ ] Swagger 및 generated model 영향 확인 | 시작: 2026-06-27 00:00 | 완료: `미완료`
- [ ] 구현 후 타입 검증 및 린트 검증 | 시작: 2026-06-27 00:00 | 완료: `미완료`

## 검토 결과

- `apps/platform-service/src/common/interfaces/request/*.dto.ts`는 이미 class 기반 구조를 사용한다.
- `apps/platform-service/src/common/interfaces/response/*.dto.ts`는 `type` 기반 공통 정의가 남아 있다.
- 도메인 응답 DTO는 상당수가 class 기반이므로, 전환의 핵심은 공통 응답 베이스의 구조 정리다.
- `EntityResponseDto<TEntity>`는 객체 매핑 성격이 강하므로, class 전환 시 표현 방식 재검토가 필요하다.
- `PageResponseDto`, `ListResponseDto`, `CursorResponseDto`처럼 공통 배열/메타 응답은 class화 우선 후보다.
- `PayloadResponseDto`와 `IdResponseDto`처럼 단순 응답은 전환 비용이 낮다.

## 계획

- 공통 response 타입별로 런타임 class 필요 여부를 분류한다.
- class 전환 대상과 유지 대상을 분리해 계약을 고정한다.
- 도메인 응답 DTO가 새 공통 베이스를 상속하도록 정리한다.
- Swagger 스키마와 generated model 영향 여부를 확인한다.
- 타입 검사와 린트를 실행해 전환 결과를 검증한다.

## 검토 포인트

- `implements` 중심 구조를 `extends` 중심 구조로 바꿀지 확인한다.
- 제네릭 응답 타입의 런타임 노출 필요성을 확인한다.
- Web generated model 재생성 필요 여부를 확인한다.
- 기존 controller와 contract의 응답 타입 선언을 함께 정리한다.
