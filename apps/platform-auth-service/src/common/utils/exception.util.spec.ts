import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';
import { describe, expect, it, vi } from 'vitest';

import { defineErrors, ExceptionGuard } from './exception.util';

describe('ExceptionGuard Bilingual Support', () => {
  const ERROR_MESSAGES = defineErrors({
    STATIC_BILINGUAL: {
      message: {
        ko: '비활성화된 계정입니다.',
        en: 'Account is inactive.',
      },
      exception: ForbiddenException,
    },
    DYNAMIC_BILINGUAL: {
      message: {
        ko: (meta?: { attempts?: number }) => `실패 횟수: ${meta?.attempts ?? 0}회`,
        en: (meta?: { attempts?: number }) => `Attempts: ${meta?.attempts ?? 0}`,
      },
      exception: UnauthorizedException,
    },
    LEGACY_STRING: {
      message: '일반적인 에러',
      exception: ForbiddenException,
    },
    LEGACY_FUNCTION: {
      message: (_meta?: unknown, lang?: string) => lang === 'en' ? 'English error' : '한국어 에러',
      exception: UnauthorizedException,
    },
  });

  const asserter = ExceptionGuard
    .withMetadata<{ attempts?: number }>()
    .setMessages(ERROR_MESSAGES);

  function mockClsLang(lang: string | null) {
    const clsMock = {
      isActive: () => lang !== null,
      get: (key: string) => key === 'acceptLanguage' ? lang : undefined,
    };
    vi.spyOn(ClsServiceManager, 'getClsService').mockReturnValue(clsMock as never);
  }

  it('resolves static and dynamic translations in Korean by default or when Cls is inactive', async () => {
    mockClsLang(null);

    // Static Bilingual -> ko
    const p1 = asserter.throw('STATIC_BILINGUAL');
    await expect(p1).rejects.toMatchObject({
      response: { message: '비활성화된 계정입니다.', code: 'STATIC_BILINGUAL' },
    });

    // Dynamic Bilingual -> ko with metadata
    const p2 = asserter.throw('DYNAMIC_BILINGUAL', { metadata: { attempts: 3 } });
    await expect(p2).rejects.toMatchObject({
      response: { message: '실패 횟수: 3회', code: 'DYNAMIC_BILINGUAL' },
    });

    // Legacy String -> ko (unchanged)
    const p3 = asserter.throw('LEGACY_STRING');
    await expect(p3).rejects.toMatchObject({
      response: { message: '일반적인 에러', code: 'LEGACY_STRING' },
    });

    // Legacy Function -> ko
    const p4 = asserter.throw('LEGACY_FUNCTION');
    await expect(p4).rejects.toMatchObject({
      response: { message: '한국어 에러', code: 'LEGACY_FUNCTION' },
    });
  });

  it('resolves static and dynamic translations in English when accept-language is en', async () => {
    mockClsLang('en-US');

    // Static Bilingual -> en
    const p1 = asserter.throw('STATIC_BILINGUAL');
    await expect(p1).rejects.toMatchObject({
      response: { message: 'Account is inactive.', code: 'STATIC_BILINGUAL' },
    });

    // Dynamic Bilingual -> en with metadata
    const p2 = asserter.throw('DYNAMIC_BILINGUAL', { metadata: { attempts: 5 } });
    await expect(p2).rejects.toMatchObject({
      response: { message: 'Attempts: 5', code: 'DYNAMIC_BILINGUAL' },
    });

    // Legacy Function -> en
    const p4 = asserter.throw('LEGACY_FUNCTION');
    await expect(p4).rejects.toMatchObject({
      response: { message: 'English error', code: 'LEGACY_FUNCTION' },
    });
  });
});
