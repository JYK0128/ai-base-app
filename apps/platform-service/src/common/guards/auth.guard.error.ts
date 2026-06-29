import { ForbiddenException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  INACTIVE_ACCOUNT: {
    message: {
      ko: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      en: 'Account is inactive. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
  INACTIVE_MEMBER: {
    message: {
      ko: '비활성화된 멤버 권한입니다. 관리자에게 문의하세요.',
      en: 'Inactive member permissions. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
  INACTIVE_ORGANIZATION: {
    message: {
      ko: '소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.',
      en: 'Your organization is inactive. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
  DORMANT_ACCOUNT: {
    message: {
      ko: '장기간 미접속으로 인해 휴면 상태로 전환된 계정입니다. 본인 인증 후 이용해주세요.',
      en: 'Dormant account due to inactivity. Please verify your identity first.',
    },
    exception: ForbiddenException,
  },
  PASSWORD_CHANGE_REQUIRED: {
    message: {
      ko: '비밀번호를 변경해야 이용할 수 있습니다.',
      en: 'You must change your password before continuing.',
    },
    exception: ForbiddenException,
  },
  TERMS_AGREEMENT_REQUIRED: {
    message: {
      ko: '약관에 동의해야 이용할 수 있습니다.',
      en: 'You must agree to the terms before continuing.',
    },
    exception: ForbiddenException,
  },
  INSUFFICIENT_PERMISSIONS: {
    message: {
      ko: '이 리소스에 접근할 권한이 없습니다.',
      en: 'Insufficient permissions to access this resource.',
    },
    exception: ForbiddenException,
  },
});

export const AuthGuardAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
