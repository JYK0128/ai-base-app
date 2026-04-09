# 백엔드 아키텍처 상세 사양서 (Cloud-Agnostic Edition)

## 1. 아키텍처 개요

어느 클라우드 환경에서도 동일한 소스 코드로 구동 가능한 **백엔드 이식성(Backend Portability)**을 최우선으로 합니다.

## 2. 기술 스택 원칙

* **NestJS / TypeScript**: 환경에 구애받지 않는 표준 런타임 사용.
* **Mikro-ORM (Data Mapper)**: 특정 DB 엔진에 종속되지 않는 추상화된 데이터 접근 계층 유지.
* **Standard Protocols**: AWS SDK 등 특정 벤더 라이브러리 사용을 최소화하고 SMTP, S3 API, AMQP 등 표준 프로토콜 기반 연동 지향.

## 3. 핵심 구현 전략

* **Environment Abstraction**: DB 호스트, 스토리지 엔드포인트 등을 환경변수(Env)로 완벽히 분리하여 배포 시점에 유연하게 변경 가능하게 합니다.
* **Shared Nothing Architecture**: 마이크로서비스 간 코드 및 데이터베이스 공유를 금지하여 독립적 생존성을 확보합니다.
* **Event-driven Consistency**: RabbitMQ 등 표준 메시지 브로커를 통해 서비스 간 정합성을 유지합니다.

## 4. 데이터 보안 전략

* **Application-level Encryption**: 인프라 레벨의 암호화(AWS KMS 등) 대신, 어플리케이션 소스 코드 레벨에서 AES/RSA 등 표준 알고리즘을 사용하여 환경 독립적인 보안성을 갖춥니다.
