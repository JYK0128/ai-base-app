# 인터페이스 표준 (요약)

## 1. 통신 및 기본 규격

* **표준**: HTTPS / RESTful API / JSON (UTF-8)
* **버저닝**: `/api/v1/...` 형태의 URL Path 기반 관리

## 2. 공통 헤더

* `Authorization`: Bearer JWT 토큰
* `X-Tenant-ID`: 테넌트 식별 및 데이터 격리 기준값
* `X-Request-ID`: 전 구간 트랜잭션 추적용 UUID

## 3. 표준 응답 구조 (Envelope)

* **성공**: `{"success": true, "data": {...}, "message": "...", "requestId": "..."}`
* **실패**: `{"success": false, "error": {"code": "...", "message": "..."}, "requestId": "..."}`
* **가이드**: RFC 7807(Problem Details) 에러 규격 준수

## 4. HTTP 상태 코드 가이드

* **200/201**: 요청 성공 및 리소스 생성
* **400/404**: 클라이언트 요청 오류(파라미터/리소스 부재)
* **401/403**: 보안 인증 실패 및 접근 권한 부족
* **429/500**: 서비스 요청 초과(Rate Limit) 및 서버 내부 오류
