# CQRS 도메인 및 디렉토리 구조

Feature-First(기능 중심) 구조에 기반한 파일 배치와 역할 분리 기준 정의. 과도한 폴더 깊이를 지양하고 파일명과 경로만으로 역할 파악이 가능하도록 구성함.

---

## 📂 1. Feature-First 레이아웃

모든 CQRS 관련 파일을 기술적 역할(Controllers, Handlers 등)로 나누지 않고, **도메인 피처(Feature)** 단위로 그룹화하여 관리함.

* 단일 유스케이스와 관련된 모든 계약, DTO, 핸들러, 에러 정의 파일을 동일 디렉토리에 위치시킴.
* 특정 기능 수정 시 컨텍스트 스위칭 최소화.

### 📐 디렉토리 구조 예시 (`domains/members`)

```text
domains/members/
├── create-invite/                       # [Feature] 멤버 초대 생성 유스케이스
│   ├── create-invite.contract.ts        # CQRS Command 메시지 계약
│   ├── create-invite.request.dto.ts     # 외부 입력 검증 DTO
│   ├── create-invite.response.dto.ts    # 처리 결과 DTO
│   ├── create-invite.error.ts           # 유스케이스 전용 에러 정의 및 어서터
│   ├── create-invite.handler.ts         # Command 핸들러 (비즈니스 오케스트레이터)
│   └── invite-email.publisher.ts        # RabbitMQ 등 외부 이벤트 발행기
├── get-member/                          # [Feature] 멤버 단건 조회 유스케이스
│   ├── get-member.contract.ts           # CQRS Query 메시지 계약
│   ├── get-member.request.dto.ts
│   ├── get-member.response.dto.ts
│   ├── get-member.error.ts
│   └── get-member.handler.ts            # Query 핸들러 (조회 전용)
├── members.controller.ts                # HTTP 진입점 (모든 Member 관련 피처 조율)
└── members.module.ts                    # NestJS 모듈 정의 및 의존성 주입(Wiring)
```

> [!IMPORTANT]
> **피처별 전용 DTO 작성 원칙**: 모든 피처(Feature)는 변경 영향도를 격리하고 독립성을 높이기 위해, 각 피처 폴더 내에 전용 DTO(`*.request.dto.ts`, `*.response.dto.ts`)를 개별적으로 작성하여 사용함. 구조나 필드가 서로 유사하더라도 각 유스케이스가 독립적으로 진화하도록 격리함.

---

## 🏷️ 2. 구성 파일 명명 규칙 (Naming Conventions)

일관된 명명 규칙을 적용하여 파일의 기술적 역할과 비즈니스 책임을 명확히 구분함.

| 파일 확장자 규칙 | 설명 | 예시 |
| :--- | :--- | :--- |
| `*.contract.ts` | NestJS CQRS `Command` / `Query`를 확장한 메시지 규격 클래스 | `create-invite.contract.ts` |
| `*.handler.ts` | 비즈니스 흐름을 오케스트레이션하는 `ICommandHandler` / `IQueryHandler` 구현 클래스 | `create-invite.handler.ts` |
| `*.error.ts` | `defineErrors`와 `ExceptionGuard`를 조합하여 생성한 도메인 어서터 상수 | `create-invite.error.ts` |
| `*.request.dto.ts` | 클라이언트 입력값 검증 데코레이터가 포함된 요청 DTO 클래스 | `create-invite.request.dto.ts` |
| `*.response.dto.ts` | 클라이언트에 전달될 구조화된 응답 DTO 클래스 | `create-invite.response.dto.ts` |
| `*.publisher.ts` | 비동기 이벤트 발행을 담당하는 로컬 서비스 클래스 | `invite-email.publisher.ts` |

---

## 🔄 3. Import 및 Export 규칙

* **로컬 우선 참조**: Feature 폴더 내부 파일 간 상대 경로(예: `./create-invite.contract`)를 사용하여 강한 결합 관계를 유지함.
* **별칭(Alias) 활용**: 타 도메인이나 공통 모듈 참조 시 tsconfig 별칭(예: `@/domains/mail/mail.contract`)을 명시하여 경로 가독성을 제고함.
* **명시적 개별 Import 지향**: 순환 참조(Circular Dependency) 예방 및 물리적 파일 위치 파악의 편의성을 위해, Barrel Export(`index.ts`) 우회 참조 대신 개별 파일 경로를 직접 지정하여 명시적으로 Import함.

---

## 🛠️ 4. NestJS 모듈 통합 (Wiring)

핸들러 및 퍼블리셔 등의 의존성은 도메인 모듈(예: `MembersModule`)의 `providers` 배열에 명시적으로 등록해야 NestJS CQRS가 정상적으로 감지함.

```typescript
// domains/members/members.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MembersController } from './members.controller';
import { CreateInviteHandler } from './create-invite/create-invite.handler';
import { InviteEmailPublisher } from './create-invite/invite-email.publisher';
import { GetMemberHandler } from './get-member/get-member.handler';

@Module({
  imports: [CqrsModule],
  controllers: [MembersController],
  providers: [
    // 1. Handlers
    CreateInviteHandler,
    GetMemberHandler,
    
    // 2. Publishers
    InviteEmailPublisher,
  ],
})
export class MembersModule {}
```
