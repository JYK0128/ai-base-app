import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({});

export const GetActiveTermsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
