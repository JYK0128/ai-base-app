# 네트워크 정책 및 보안 규칙 (Network Policy & Security Rules)

## 1. 제로 트러스트 네트워크 정책 (Zero-Trust NetworkPolicy)

- **기본 정책 (Default Deny)**:
  - 네임스페이스 내 모든 파드(Pod)의 인그레스(Ingress) 및 이그레스(Egress) 통신은 기본 차단으로 구성함
- **명시적 허용 (Explicit Allow)**:
  - 비즈니스 통신에 꼭 필요한 경로(예: Gateway ➡️ Core-Service, Core-Service ➡️ Database)에 대해서만 전용 NetworkPolicy를 작성하여 허용함
- **네임스페이스 경계**:
  - 타 네임스페이스와의 통신 시 네임스페이스 셀렉터(`namespaceSelector`)를 명확히 선언하여 의도치 않은 서비스 노출을 방지함

---

## 2. 민감 정보 관리 (Secret Management)

- **보안 정보 저장**:
  - 비밀번호, API 토큰, 데이터베이스 연결 문자열(Credentials), 프라이빗 키, 인증서 등 모든 보안 정보는 쿠버네티스 `Secret` 오브젝트에 저장하여 구성함
  - 보안 정보가 평문으로 형상 관리에 커밋되는 것을 막기 위해, 로컬 개발 환경용은 별도 디바이스 주입 방식을 사용함

---

## 3. 임시 자원 격리 (Resource Isolation)

- **`.tmp/` 폴더 활용**:
  - 임시 작업 스크립트, 실험적 YAML 명세, 스냅샷 등 일시적으로 사용하는 파일은 반드시 `.tmp/` 디렉토리 하위에서 관리함
  - 모든 임시 및 실험용 설정 파일은 `.tmp/` 디렉토리 하위에서만 생성하여 형상 관리를 정갈하게 유지함
