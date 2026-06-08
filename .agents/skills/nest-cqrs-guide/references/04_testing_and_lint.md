# 단위 테스트 작성 표준 & 린트 가이드 (Testing & Lint Guide)

## 1. 단위 테스트 작성 표준 (Testing Guide)

- **테스트 러너**: **Vitest** 프레임워크 전면 사용
- **단위 격리 모킹 (Static Active Record)**: 데이터베이스 실 연결 및 인프라 오버헤드 차단을 위해 EntityManager나 Repository를 직접 주입받지 않는 경우, 엔티티 클래스의 스태틱 메소드(`vi.spyOn(Entity, 'methodName')`)를 스파이 모킹하여 비즈니스 데이터 처리를 시뮬레이션함.
- **가드 검증**: Asserter 동작에 따른 비즈니스 예외 투척 상황을 `.rejects.toBeInstanceOf(Exception)` 구문으로 엄격히 실 단언 검증

```typescript
import { NotFoundException } from '@nestjs/common';
import { Announcement } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetAnnouncementHandler } from './get-announcement.handler';
import { GetAnnouncementQuery } from './get-announcement.query';

describe('GetAnnouncementHandler', () => {
  let handler: GetAnnouncementHandler;

  beforeEach(() => {
    handler = new GetAnnouncementHandler();
    vi.restoreAllMocks(); // 각 테스트 격리를 위해 모의 스파이 리셋
  });

  it('성공적으로 공지사항을 조회하고 노드 상세 데이터를 반환해야 한다', async () => {
    // Given
    const mockAnnouncement = {
      id: 'ann-1',
      title: '새 기능 출시 공지',
      content: '새 기능이 출시되었습니다. 많이 이용해주세요.',
    } as unknown as Announcement;

    const findOneSpy = vi.spyOn(Announcement, 'findOne')
      .mockResolvedValueOnce(mockAnnouncement);

    // When
    const result = await handler.execute(
      new GetAnnouncementQuery({ announcementId: 'ann-1' }),
    );

    // Then
    expect(result).toBeDefined();
    expect(result.id).toBe('ann-1');
    expect(findOneSpy).toHaveBeenCalledWith({ id: 'ann-1' });
  });

  it('공지사항을 찾을 수 없는 경우 NotFoundException을 던져야 한다', async () => {
    // Given
    vi.spyOn(Announcement, 'findOne').mockResolvedValueOnce(null);

    // When & Then
    await expect(
      handler.execute(new GetAnnouncementQuery({ announcementId: 'non-existent' })),
    )
      .rejects
      .toBeInstanceOf(NotFoundException);
  });
});
```

---

## 2. 기타 주의사항 및 린트 가이드

- **Import 규칙**: 모듈 외부의 전역 유틸리티/공용 컴포넌트는 상대 경로(Relative Path)를 사용하고, 도메인 데이터베이스 및 패키지 구조는 `@pkg/database`와 같은 전역 단축 오라클 임포트 명칭 활용
- **Transactional 제어**: 상태 변경(CUD) 작업을 포함하여 원자적(Atomic) 트랜잭션 단위로 묶어야 하는 경우에 한하여 `@Transactional()`을 부여하며, 단순 조회(Query) 작업은 트랜잭션 없이 처리함
