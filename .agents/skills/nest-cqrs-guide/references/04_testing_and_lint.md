# CQRS 테스트 및 린트 가이드

본 문서는 Vitest 기반의 NestJS CQRS 핸들러 테스트 구현 방법 및 코드 퀄리티를 유지하기 위한 정적 분석/빌드 검증 프로세스를 규정합니다.

---

## 🧪 1. CQRS 핸들러 단위 테스트 구현 패턴

핸들러 테스트는 NestJS 의존성 주입 컨테이너 기동 오버헤드를 배제하기 위해, 생성자를 통해 의존성을 수동으로 모킹 주입(Manual Mocking)하는 순수 단위 테스트 형태로 작성하는 것을 권장합니다.

* **ClsService 모킹**: `cls.get` 메서드가 특정 테스팅 컨텍스트(ID 등)를 반환하도록 Mock을 정의합니다.
* **비동기 예외 검증**: `ExceptionGuard`를 통한 실패 케이스는 `expect(...).rejects.toThrow()` 구조를 사용하여 특정 예외 클래스(예: `NotFoundException`)가 안전하게 던져지는지 검증합니다.
* **이벤트 발행 검증**: 비동기 사이드 이펙트를 주입받는 Publisher의 emit 메서드가 규격에 맞춰 정상 호출되었는지 `vitest` 스파이(spy) 기능을 사용해 확인합니다.

### 💻 구현 예시 (`create-invite.handler.test.ts`)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { CreateInviteHandler } from './create-invite.handler';
import { CreateInviteContract } from './create-invite.contract';
import { CreateInviteRequestDto } from './create-invite.request.dto';
import { InviteEmailPublisher } from './invite-email.publisher';
import { Organization, Member, MemberInvite } from '@pkg/database';
import { NotFoundException } from '@nestjs/common';

describe('CreateInviteHandler', () => {
  let handler: CreateInviteHandler;
  let clsMock: vi.Mocked<ClsService>;
  let publisherMock: vi.Mocked<InviteEmailPublisher>;

  beforeEach(() => {
    // 1. 의존성 Mocking 선언
    clsMock = {
      get: vi.fn(),
    } as unknown as vi.Mocked<ClsService>;

    publisherMock = {
      publishInviteEmail: vi.fn(),
    } as unknown as vi.Mocked<InviteEmailPublisher>;

    // 2. 핸들러 수동 주입 인스턴스화
    handler = new CreateInviteHandler(clsMock, publisherMock);

    // 3. 글로벌 Mock 설정 초기화
    vi.clearAllMocks();
  });

  it('성공: 정상적인 조건에서 멤버 초대를 생성하고 메일 전송 이벤트를 발행해야 한다', async () => {
    // Given
    const organizationMock = { name: '테스트 조직' } as Organization;
    const inviterMock = { name: '초대자' } as Member;
    const inviteMock = { id: 'invite-123', email: 'test@example.com', token: 'token-uuid' } as MemberInvite;

    clsMock.get.mockImplementation((key) => {
      if (key === 'organizationId') return 'org-123';
      if (key === 'memberId') return 'member-123';
      return null;
    });

    // 데이터베이스 조회용 static 메서드 모킹
    vi.spyOn(Organization, 'findOne').mockResolvedValue(organizationMock);
    vi.spyOn(Member, 'findOne').mockResolvedValue(inviterMock);
    vi.spyOn(MemberInvite, 'create').mockResolvedValue(inviteMock);

    const requestDto = new CreateInviteRequestDto();
    requestDto.name = '홍길동';
    requestDto.email = 'test@example.com';
    const contract = new CreateInviteContract(requestDto);

    // When
    const result = await handler.execute(contract);

    // Then
    expect(result.id).toBe('invite-123');
    expect(publisherMock.publishInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        inviteId: 'invite-123',
        email: 'test@example.com',
        organizationName: '테스트 조직',
        inviterName: '초대자',
      })
    );
  });

  it('실패: 컨텍스트 내 조직 ID가 존재하지 않으면 NotFoundException을 발생시켜야 한다', async () => {
    // Given
    clsMock.get.mockReturnValue(null); // 조직 ID 없음

    const requestDto = new CreateInviteRequestDto();
    const contract = new CreateInviteContract(requestDto);

    // When & Then
    await expect(handler.execute(contract)).rejects.toThrow(NotFoundException);
    expect(publisherMock.publishInviteEmail).not.toHaveBeenCalled();
  });
});
```

---

## 🧹 2. 린트 및 품질 유지 (Linting & Clean Code)

CQRS 레이어의 응답 가독성과 컴파일 오류 방지를 위해 아래 정적 분석 룰을 준수해야 합니다.

* **타입 명시(Explicit Return Types)**: 핸들러의 `execute` 메서드 선언부에는 `Promise<ResponseDto>` 형태로 최종 응답 DTO 타입을 항상 생략 없이 명시해야 타입 안전성이 깨지지 않습니다.
* **불필요한 import 제거**: 파일 리팩터링 완료 후, 미사용 import 구문이 남아있지 않도록 사용 중인 IDE 혹은 CLI `lint` 도구를 실행하여 깔끔하게 정리합니다.
* **컴파일 오류 사전 검출**: 메시지 규격(Contract)이나 DTO 필드 정의를 수정했을 때는 반드시 로컬 패키지 수준에서 TypeScript 컴파일 검증을 실행합니다.

### 🔍 로컬 패키지 수동 검증 명령어

```bash
# platform-service 빌드 검증
pnpm --filter platform-service exec tsc -p tsconfig.app.json --noEmit

# platform-service 린트 검증
pnpm --filter platform-service lint
```
