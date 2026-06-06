# 단위 테스트 작성 표준 & 린트 가이드 (Testing & Lint Guide)

## 1. 단위 테스트 작성 표준 (Testing Guide)

- **테스트 러너**: **Vitest** 프레임워크 전면 사용
- **단위 격리 모킹**: 데이터베이스 실 연결 및 인프라 오버헤드 차단을 위해 EntityManager 및 Repository는 `vi.fn()`으로 모킹 처리
- **가드 검증**: Asserter 동작에 따른 비즈니스 예외 투척 상황을 `.rejects.toBeInstanceOf(Exception)` 구문으로 엄격히 실 단언 검증

```typescript
import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Resource, ResourceType } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetResourceHandler } from './get-resource.handler';
import { GetResourceCommand } from './get-resource.query';

describe('GetResourceHandler', () => {
  let em: EntityManager;
  let handler: GetResourceHandler;
  let findOneMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findOneMock = vi.fn();
    em = {
      findOne: findOneMock,
    } as unknown as EntityManager;

    handler = new GetResourceHandler(em);
  });

  it('성공적으로 단일 리소스를 조회하고 노드 상세 데이터를 반환해야 한다', async () => {
    // Given
    const mockResource = {
      id: 'res-1',
      code: 'SYSTEM_SETTINGS',
      name: '시스템 설정',
      type: ResourceType.MENU,
      path: '/settings',
      icon: 'SettingIcon',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      parent: { id: 'parent-0' } as Resource,
    } as unknown as Resource;

    findOneMock.mockResolvedValueOnce(mockResource);

    // When
    const result = await handler.execute(new GetResourceCommand('res-1'));

    // Then
    expect(result).toEqual({
      id: 'res-1',
      code: 'SYSTEM_SETTINGS',
      name: '시스템 설정',
      type: ResourceType.MENU,
      path: '/settings',
      icon: 'SettingIcon',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      parentId: 'parent-0',
    });

    expect(findOneMock).toHaveBeenCalledWith(
      expect.any(Function),
      { id: 'res-1' },
      { populate: ['parent'] },
    );
  });

  it('리소스를 찾을 수 없는 경우 NotFoundException을 던져야 한다', async () => {
    // Given
    findOneMock.mockResolvedValueOnce(null);

    // When & Then
    await expect(handler.execute(new GetResourceCommand('non-existent')))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });
});
```

---

## 2. 기타 주의사항 및 린트 가이드

- **Import 규칙**: 모듈 외부의 전역 유틸리티/공용 컴포넌트는 상대 경로(Relative Path)를 사용하고, 도메인 데이터베이스 및 패키지 구조는 `@pkg/database`와 같은 전역 단축 오라클 임포트 명칭 활용
- **Transactional 제어**: 상태 변경(CUD) 작업을 포함하여 원자적(Atomic) 트랜잭션 단위로 묶어야 하는 경우에 한하여 `@Transactional()`을 부여하며, 단순 조회(Query) 작업은 트랜잭션 없이 처리함
