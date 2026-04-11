# 인프라 아키텍처 및 시스템 구성 (요약)

## 1. 네트워크 보안 (Networking)

* **VPC 격리**: Public(Gateway/NAT), Private(App), Data(DB) 영역의 논리적 서브넷 분리
* **위협 방어**: WAF(Web Application Firewall) 및 DDoS Shield 적용으로 비정상 트래픽 차단

## 2. 컴퓨팅 및 오케스트레이션

* **환경**: 컨테이너 기반 마이크로서비스 운영 (Amazon EKS/ECS)
* **확장성**: 부하 기반 실시간 자동 확장(Auto Scaling, HPA) 및 단일 진입점(Gateway) 구축

## 3. 데이터 및 저장소

* **DB/Cache**: 가용성 확보를 위한 Multi-AZ RDS 및 성능 향상을 위한 Redis(ElastiCache)
* **Storage**: S3 기반 파일 저장 및 CloudFront(CDN) 연동을 통한 전역 전속 최적화

## 4. 운영 관측성 및 자동화 (IaC)

* **관측성**: 중앙 집중형 로깅(ELK/CloudWatch) 및 메트릭 시각화(Prometheus & Grafana)
* **자동화**: Terraform 기반의 모든 인프라 자원 코드화(IaC) 및 Git 버전 관리 수행

## 5. 배포 파이프라인 (CI/CD)

* **CI**: GitHub Actions 기반 빌드, 단위 테스트 및 패키지 보안 스캔 자동화
* **CD**: 무중단 배포(Blue-Green, Canary) 전략을 통한 릴리즈 안정성 확보
