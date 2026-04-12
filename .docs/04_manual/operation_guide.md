# 운영 가이드 (Operation Guide)

본 문서는 현재 `.k8s` 기준의 배포/점검/장애 대응 절차를 정의함.

## 1. 표준 배포 순서

1. 네임스페이스 생성
   - `kubectl apply -f .k8s/namespaces`
2. 네트워크 정책 적용
   - `kubectl apply -f .k8s/network-policies`
3. 핵심 인프라 적용
   - `kubectl apply -R -f .k8s/database`
   - `kubectl apply -R -f .k8s/messaging`
4. 애플리케이션 적용
   - `kubectl apply -R -f .k8s/apps`
5. 네트워킹/모니터링 적용
   - `kubectl apply -f .k8s/networking`
   - `kubectl apply -R -f .k8s/monitoring`

## 2. 서비스별 헬스체크 운영 기준

### 2.1 platform-auth-service

- **헬스 엔드포인트**
  - `GET /health/live`
  - `GET /health/ready`
- **구성 방식**
  - HTTP + RMQ 하이브리드(HTTP 서버 + RabbitMQ 마이크로서비스)
  - `@nestjs/terminus` 기반 구현
- **readiness 기준**
  - RabbitMQ 연결 가능 시 `200`, 불가 시 `503`

### 2.2 service-gateway

- **헬스 엔드포인트**
  - `GET /health/live`
  - `GET /health/ready`
- **구성 방식**
  - HTTP 앱 + `@nestjs/terminus`
- **readiness 기준**
  - RabbitMQ ping 성공 시 Ready

### 2.3 Kubernetes Probe 매핑

- `startupProbe` -> `/health/live`
- `livenessProbe` -> `/health/live`
- `readinessProbe` -> `/health/ready`

## 3. 운영 점검 명령어

- 전체 파드 상태
  - `kubectl get pods -A`
- 특정 서비스 롤아웃 상태
  - `kubectl rollout status deployment/platform-auth-service -n dev-api`
  - `kubectl rollout status deployment/service-gateway -n dev-web`
- 네트워크 정책 확인
  - `kubectl get networkpolicy -A`
- 프로브/이벤트 확인
  - `kubectl describe pod <pod-name> -n <namespace>`
  - `kubectl get events -n <namespace> --sort-by=.lastTimestamp`
- 로그 확인
  - `kubectl logs <pod-name> -n <namespace> -c <container-name> --tail=200`

## 4. 주요 장애 대응

### 4.1 readiness 503 / startup 실패

1. 앱 로그에서 `/health/ready` 실패 원인 확인
2. RabbitMQ/DB 연결 상태 확인
3. NetworkPolicy에서 해당 트래픽 허용 여부 확인

### 4.2 CrashLoopBackOff

1. `kubectl logs --previous`로 직전 종료 원인 확인
2. 환경 변수 누락 여부 확인 (`ConfigMap`, `Secret`)
3. 이미지 태그/엔트리포인트/프로브 경로 불일치 점검

### 4.3 ImagePullBackOff

1. 이미지 태그 존재 여부 확인
2. 프라이빗 레지스트리 인증(`imagePullSecrets`) 확인
3. 동일 매니페스트를 `--dry-run=server`로 검증 후 재적용

---
*최종 업데이트: 2026-04-13*
