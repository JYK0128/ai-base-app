# Billing & Ledger Service 상세 사양서 (High-Fidelity)

## 1. 개요

본 서비스는 플랫폼 내의 모든 금전적 거래를 정통 복식부기(Double-Entry) 원칙에 따라 기록하고, 외부 PG(결제 게이트웨이) 연동 및 파트너 정산을 총괄하는 재무 엔진입니다.

## 2. 복식부기 및 정산 엔진

### 2.1. 계정 체계 (Chart of Accounts)

모든 거래는 반드시 '차변(Debit) 합계 == 대변(Credit) 합계'가 일치하는 한 쌍 이상의 원장(Ledger) 기록으로 남습니다.

* **Asset(자산)**: 현금(Cash), 매출채권(AR)
* **Liability(부채)**: 미지급금(AP - 파트너 정산금), 환불 충담금
* **Revenue(수익)**: 구독료 수익, 플랫폼 수수료 수익

### 2.2. 결제 및 정산 프로세스 (Flow)

1. **인보이스 발행**: 구독 갱신 시 `UNPAID` 상태의 `Invoice` 생성.
2. **결제 승인**: 외부 PG(Toss, Stripe 등) 결제 완료 Webhook 수신.
3. **전표 및 원장 생성**:
    * `JournalEntry` 생성 (예: "구독 결제 완료 - Org: A")
    * `Debit`: Cash 계정 (+11,000 KRW)
    * `Credit`: Revenue 계정 (+10,000 KRW)
    * `Credit`: Tax Payable 계정 (+1,000 KRW)
4. **정산 일괄 처리**: 정산 기일에 따라 파트너 정산금 산출 및 `SettlementRequest` 생성.

## 3. 핵심 API 명세

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/invoices/batch` | 일괄 인보이스 생성 배치 (Cron) |
| `POST` | `/payments/webhook/:provider` | PG사 결제 결과 수신 및 원장 기록 자동화 |
| `GET` | `/ledger/entry` | 특정 조직/계정별 재무 상세 이력 조회 |
| `POST` | `/settlements/calculate` | 파트너별 정산 대상 금액 합산 및 확정 |
| `PATCH` | `/invoices/:id/void` | 잘못 발행된 인보이스 무효화 및 보정 전표 발행 |

## 4. 데이터 무결성 정책 (Financial Guardrails)

* **Immutable Ledger**: 한 번 확정된 `LedgerEntry`는 절대 수정하거나 삭제할 수 없습니다. 오입력 시에는 반드시 상쇄 전표(Correction Entry)를 발행하여 보정해야 합니다.
* **Data Encryption at Rest (KMS)**: 파트너의 실제 계좌 정보, 정산 증빙 서식 등 민감한 재무 정보는 데이터베이스 저장 시 **KMS(AWS Key Management Service)**를 통한 어플리케이션 레벨 암호화를 거쳐 저장해야 합니다.
* **Reconciliation (재무 대조)**: 매일 자정 PG사 대사 데이터와 내부 `Cash` 계정 잔액을 대조하여 1원 단위의 오차까지 추적하여 로그를 남깁니다.

## 5. 법적 컴플라이언스 및 증빙 (Legal Compliance)

* **정산 내역 다운로드**: 관리자 및 파트너사가 월별 정산 내역을 CSV 파일로 다운로드할 수 있는 기능을 제공합니다.
* **표준 부가세 계산**: 국내 세법 기준의 표준 부가세(10%) 계산 로직을 적용한 명세서를 발행합니다.

## 5. [CODE] Mikro-ORM 엔터티 구현 명세

```typescript
import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Collection } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity()
export class FinancialAccount {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property() name!: string;
  @Property() type!: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE';
  @Property({ default: 'KRW' }) currency = 'KRW';
}

@Entity()
export class JournalEntry {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property() description!: string;
  @Property() createdAt = new Date();
  @OneToMany(() => LedgerEntry, (e) => e.journalEntry) entries = new Collection<LedgerEntry>(this);
  
  // 외부 참조 정보 (e.g., Payment ID, Subscription ID)
  @Property({ index: true, nullable: true }) referenceId?: string;
  @Property({ nullable: true }) referenceType?: string;
}

@Entity()
export class LedgerEntry {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @ManyToOne(() => JournalEntry) journalEntry!: JournalEntry;
  @ManyToOne(() => FinancialAccount) account!: FinancialAccount;
  @Property({ type: 'decimal', precision: 19, scale: 4 }) amount!: number;
  @Property() direction!: 'DEBIT' | 'CREDIT';
}

@Entity()
export class Invoice {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property({ index: true }) organizationId!: string;
  @Property({ index: true }) subscriptionId!: string; // 구독 서비스 연동 키
  @Property({ type: 'decimal' }) subtotalAmount!: number;
  @Property({ type: 'decimal' }) taxAmount!: number;
  @Property({ type: 'decimal' }) totalAmount!: number;
  @Property({ default: 'KRW' }) currency = 'KRW';
  
  @Property({ default: 'UNPAID' }) status!: 'UNPAID' | 'PAID' | 'VOID' | 'REFUNDED';
  @Property() issuedAt = new Date();
  @Property({ nullable: true }) paidAt?: Date;
}

@Entity()
export class SettlementRequest {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property({ index: true }) organizationId!: string;
  @Property({ type: 'decimal' }) amount!: number;
  @Property({ default: 'PENDING' }) status!: 'PENDING' | 'PROCESSED' | 'FAILED';
  @Property() scheduledDate!: Date;
  @Property({ nullable: true }) processedAt?: Date;
}
```
