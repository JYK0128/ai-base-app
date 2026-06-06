# 배포 및 검증 절차 (Deployment & Validation)

## 1. 사전 문법 검증 (Validation)

- **Kustomize 빌드 테스트**:
  - 변경된 오버레이 경로에 대해 빌드가 유효한지 사전에 확인함
  - **검증 명령**: `kubectl kustomize .k8s/overlays/dev` 또는 `kubectl kustomize .k8s/overlays/prod`
- **클라이언트 드라이런**:
  - 문법 오류 및 명세 유효성 검증을 위해 dry-run을 실행함
  - **검증 명령**: `kubectl apply -k .k8s/overlays/dev --dry-run=client`

---

## 2. 로컬 빌드 및 배포 스크립트 실행 (Scripts)

- **인프라 엔진 통합 설치**:
  - 오퍼레이터, 서비스 메쉬 및 메시지 브로커 등의 설치는 아래 스크립트로 수행함
  - **실행 명령**: `bash .k8s/scripts/setup-infra.sh`
- **서버 애플리케이션 빌드 및 배포**:
  - 플랫폼 백엔드 서비스 이미지 빌드 및 디플로이먼트 교체는 아래 스크립트로 수행함
  - **실행 명령**: `bash .k8s/scripts/up-server.sh`
- **어드민 웹 빌드 및 배포**:
  - 프론트엔드 어드민 화면 이미지 빌드 및 디플로이먼트 교체는 아래 스크립트로 수행함
  - **실행 명령**: `bash .k8s/scripts/up-web.sh`

---

## 3. 배포 무결성 검증 (Runtime Check)

- **파드(Pod) 기동 상태 확인**:
  - 배포 후 모든 파드가 `Running` 및 `Ready` 상태에 정상 진입했는지 관측함
  - **확인 명령**: `kubectl get pods -n dev-service`
- **이벤트 로그 진단**:
  - 파드 크래시, 이미지 풀링 실패, 혹은 Liveness/Readiness probe 검증 실패 등의 비정상 이벤트 유무를 검사함
  - **확인 명령**: `kubectl describe pod <pod-name> -n <namespace>`
