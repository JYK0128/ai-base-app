import type { ExceptionAsserter } from '@pkg/shared/server';

import { GetAnnouncementAsserter } from '@/domains/announcement/get-announcement/get-announcement.error';
import { AgreeTermsAsserter } from '@/domains/auth/agree-terms/agree-terms.error';
import { ChangePasswordAsserter } from '@/domains/auth/change-password/change-password.error';
import { DeferPasswordChangeAsserter } from '@/domains/auth/defer-password-change/defer-password-change.error';
import { LoginAsserter } from '@/domains/auth/login/login.error';
import { MeAsserter } from '@/domains/auth/me/me.error';
import { SendInviteEmailAsserter } from '@/domains/mail/send-invite-email/send-invite-email.error';
import { CreateInviteAsserter } from '@/domains/member/create-invite/create-invite.error';
import { GetMemberAsserter } from '@/domains/member/get-member/get-member.error';
import { GetMemberPageAsserter } from '@/domains/member/get-member-page/get-member-page.error';
import { UpdateMemberRoleAsserter } from '@/domains/member/update-member-role/update-member-role.error';
import { UpdateMemberStatusAsserter } from '@/domains/member/update-member-status/update-member-status.error';
import { ApproveOrganizationAsserter } from '@/domains/organization/approve-organization/approve-organization.error';
import { GetOrganizationRoleListAsserter } from '@/domains/organization/organization-role-list/get-organization-role-list.error';
import { GetResourceAsserter } from '@/domains/resource/get-resource/get-resource.error';
import { GetResourceListAsserter } from '@/domains/resource/get-resource-list/get-resource-list.error';
import { GetRolePermissionListAsserter } from '@/domains/resource/get-role-permission-list/get-role-permission-list.error';
import { GetTicketPageAsserter } from '@/domains/support/get-ticket-page/get-ticket-page.error';
import { GetTermDocumentAsserter } from '@/domains/term/get-term-document/get-term-document.error';
import { GetTermDocumentVersionListAsserter } from '@/domains/term/get-term-document-version-list/get-term-document-version-list.error';

import { AuthGuardAsserter } from '../guards/auth.guard.error';

type MessagesOf<T> = T extends ExceptionAsserter<infer Messages> ? Messages : never;

const toCodeMap = <T extends ExceptionAsserter>(asserter: T): { [K in keyof MessagesOf<T>]: K } => {
  return Object.fromEntries(
    Object.keys(asserter.messages as object).map((key) => [key, key]),
  ) as { [K in keyof MessagesOf<T>]: K };
};

export const ErrorCode = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  ...toCodeMap(AuthGuardAsserter),
  ...toCodeMap(GetAnnouncementAsserter),
  ...toCodeMap(AgreeTermsAsserter),
  ...toCodeMap(ChangePasswordAsserter),
  ...toCodeMap(DeferPasswordChangeAsserter),
  ...toCodeMap(LoginAsserter),
  ...toCodeMap(MeAsserter),
  ...toCodeMap(SendInviteEmailAsserter),
  ...toCodeMap(CreateInviteAsserter),
  ...toCodeMap(GetMemberPageAsserter),
  ...toCodeMap(GetMemberAsserter),
  ...toCodeMap(UpdateMemberRoleAsserter),
  ...toCodeMap(UpdateMemberStatusAsserter),
  ...toCodeMap(ApproveOrganizationAsserter),
  ...toCodeMap(GetOrganizationRoleListAsserter),
  ...toCodeMap(GetResourceListAsserter),
  ...toCodeMap(GetResourceAsserter),
  ...toCodeMap(GetRolePermissionListAsserter),
  ...toCodeMap(GetTicketPageAsserter),
  ...toCodeMap(GetTermDocumentVersionListAsserter),
  ...toCodeMap(GetTermDocumentAsserter),
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
