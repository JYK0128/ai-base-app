# Infrastructure Service 상세 사양서 (MVP Edition)

## 1. 개요

Infra Service는 플랫폼 통합 알림 발송(Email/SMS/Talk), 정적 파일 관리(S3), 그리고 시스템 로그 관리를 담당합니다.

## 2. 주요 기능 상세

### 2.1. 통합 알림 발송 (Messaging)

* **이메일 발송**: 가입 환영, 비밀번호 찾기 등 기본 안내 메일 발송 (AWS SES).
* **카카오 알림톡 (AlimTalk)**: 국내 표준 정보성 메시지 발송 체계를 지원합니다. (템플릿 승인 및 변수 치환 발송)
* **문자 알림 (SMS/LMS)**: 보안 알림 및 카카오톡 발송 실패 시 **자동 전환(Fail-back)**하여 문자 메시지로 발송합니다.

### 2.2. 화이트라벨링 발신인 브랜딩 (Sender Customization)

* **발신인 정보 관리**: 각 조직(Organization)이 자신의 공식 **발신 이메일 주소**, **SMS 발신 번호**, **카카오 비즈니스 채널**을 등록하여 운영할 수 있습니다.
* **브랜드 메일/문자**: 고객에게 발송되는 모든 안내 메시지에서 플랫폼의 이름이 아닌, **해당 파트너사의 이름과 번호**가 발송인으로 표시되도록 치환하여 발송합니다.

### 2.3. 정적 파일 스토리지 (Static Storage)

* **AWS S3 연동**: 상품 이미지, 파트너 로고 등을 안전하게 저장합니다.
* **Presigned URL**: 서버 부하 방지를 위해 S3로 직접 업로드할 수 있는 임시 업로드 권한을 발급합니다.

### 2.4. 시스템 로그 및 감사 (Logging)

* **활동 기록 (Audit Log)**: 관리자의 주요 데이터 변경(등록/삭제) 이력과 접속 IP를 기록하여 보안 사고를 예방합니다.
* **데이터 마스킹**: 로그 데이터에 개인정보(전화번호 등)가 평문으로 남지 않도록 자동으로 마스킹(`***`) 처리합니다.

### 2.5. 비즈니스 리포트 (Reporting)

* **표준 통계**: 일일 가입자 수, 매출 합계 등 기본 통계를 관리자에게 제공합니다.
* **Excel 및 CSV**: 파트너사가 통계를 자사 도구에서 활용할 수 있도록 CSV 다운로드 기능을 지원합니다.

### 2.6. 고객 지원 보드 (Support FAQ)

* **공지사항 및 FAQ**: 플랫폼 전체 공지 및 자주 묻는 질문을 관리할 수 있는 관리자 기능을 제공합니다.
* **1:1 문의 접수**: 고객의 개별 문의를 이메일 형식으로 접수하고 관리자가 확인할 수 있는 기초 게시판 구조를 제공합니다.

## 3. 핵심 API 명세

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/notifications/send` | 내부 알림 발송 요청 (가입/주문 등) |
| `GET` | `/files/presign` | S3 업로드용 임시 권한 주소 발급 |
| `GET` | `/audit-logs` | 관리자 활동 기록 조회 |
| `GET` | `/reports/export` | 정산/통계 CSV 파일 생성 요청 |

## 4. [CODE] Mikro-ORM 엔터티 구현 명세

```typescript
import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity()
export class AuditLog {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property({ index: true, nullable: true }) organizationId?: string;
  @Property() actorId!: string;
  @Property() action!: string; 
  @Property({ type: 'text' }) description!: string;
  @Property() ipAddress?: string;
  @Property() createdAt = new Date();
}

@Entity()
export class FAQ {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property() question!: string;
  @Property({ type: 'text' }) answer!: string;
  @Property({ default: true }) isActive = true;
  @Property() createdAt = new Date();
}

@Entity()
export class NotificationLog {
  @PrimaryKey({ type: 'uuid' }) id = uuidv7();
  @Property({ index: true }) recipientId!: string;
  @Property() messageType!: string;
  @Property({ default: 'SENT' }) status!: 'SENT' | 'FAILED';
  @Property() sentAt = new Date();
}
```
