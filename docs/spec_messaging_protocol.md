# Messaging Protocol 상세 사양서 (High-Fidelity)

## 1. 개요

본 도큐먼트는 MSA 간 데이터 정합성을 보장하기 위한 비동기 메시징 규약(Transactional Outbox/Inbox) 및 분산 트랜잭션(Saga) 관리 정책을 정의합니다.

## 2. 표준 메시지 스키마

모든 메시지는 추적 가능성과 버전 호환성을 보장하기 위해 다음과 같은 헤더를 반드시 포함합니다.

```json
{
  "header": {
    "messageId": "uuid-v7",
    "timestamp": "2026-04-09T09:00:00Z",
    "sender": "program-service",
    "correlationId": "saga-123", // Saga 트랜잭션 추적용
    "traceId": "otel-trace-abc", // 관측성(OpenTelemetry) 연동
    "schemaVersion": "v1"
  },
  "payload": {
    "type": "SUBSCRIPTION_CREATED",
    "data": { "orgId": "uuid", "planId": "uuid" }
  }
}
```

## 3. 핵심 패턴 및 장애 복구 전략

### 3.1. Transactional Outbox & Relay

* **원칙**: 비즈니스 로직 DB 트랜잭션 내에 `OutboxEvent`를 함께 저장합니다.
* **Relay Worker**: 저장된 이벤트를 긁어 메시지 브로커(RabbitMQ)로 전송합니다. 전송 성공 시 `isProcessed = true` 처리합니다.

### 3.2. Idempotent Inbox (중복 수신 방지)

* **메커니즘**: `InboxEvent` 테이블의 `messageId` (PK)를 체크하여 이미 처리된 전력이 있다면 즉시 무시(Ignore)합니다.
* **보관 정책**: 처리된 인박스 데이터는 7일간 유지 후 TTL 캐시로 만료시키거나 배치로 삭제합니다.

### 3.3. 재시도 및 보상 정책 (Retry & Saga)

* **지수 백오프 (Exponential Backoff)**: 일시적 네트워크 장애 시 `5s -> 30s -> 5m -> 1h` 간격으로 총 4회 재시도합니다.
* **Saga Timeout**: 특정 참가 서비스가 3시간 이내에 응답하지 않으면 해당 Saga를 `FAILED`로 간주하고 보상 트랜잭션(Compensating Transaction)을 트리거합니다.
* **DLQ (Dead Letter Queue)**: 최종 재시도 실패 시, 메시지는 DLQ로 격리되며 Infra 서비스에서 알람을 발행합니다.

## 4. 메시지 브로커 설정

* **Topic Exchange**: 페이로드의 `type` 필드에 따라 관련 있는 큐로 메시지를 라우팅합니다.
* **Message Persistence**: 모든 큐는 `durable: true`로 설정하여 재부팅 시에도 메시지를 보존합니다.

## 5. [CODE] Mikro-ORM 엔터티 구현 명세

```typescript
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity()
export class OutboxEvent {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property() aggregateType!: string;
  @Property() type!: string; 
  @Property({ type: 'json' }) payload!: any;
  
  // 연동 추적
  @Property({ index: true }) correlationId?: string;
  @Property() traceId?: string;

  @Property({ default: false }) isProcessed = false;
  @Property() createdAt = new Date();
  @Property({ nullable: true }) processedAt?: Date;
}

@Entity()
export class InboxEvent {
  @PrimaryKey({ type: 'uuid' }) messageId = uuidv7(); // 수신 헤더의 messageId와 동일하게 설정
  @Property({ index: true }) sender!: string;
  @Property({ default: false }) isProcessed = false;
  @Property() processedAt = new Date();
}

@Entity()
export class SagaLog {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property({ unique: true }) correlationId!: string;
  @Property() sagaType!: string; // e.g., 'SUB_UPGRADE_SAGA'
  
  @Enum(() => ['STARTED', 'COMPLETED', 'FAILED', 'COMPENSATING']) 
  status = 'STARTED';
  
  @Property({ type: 'text', nullable: true }) lastErrorMessage?: string;
  @Property({ type: 'json', nullable: true }) metadata?: any;
  @Property() startedAt = new Date();
  @Property({ nullable: true, onUpdate: () => new Date() }) updatedAt?: Date;
  @Property({ nullable: true }) completedAt?: Date;
}
```
