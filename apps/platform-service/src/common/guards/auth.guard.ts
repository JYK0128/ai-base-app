import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatus, MemberStatus, OrganizationStatus } from '@pkg/database';
import type { AuthAccountContext, AuthMemberContext, AuthOrganizationContext, AuthTermsSnapshotContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { BYPASS_KEY, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

import { AuthGuardAsserter } from './auth.guard.error';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.checkPublic(context)) {
      const { account, member, organization, terms, permissions } = this.readAccountContext();
      const bypassPolicies = this.readBypassPolicies(context);

      // 계정 정책
      await this.assertAccountIsActive(account.status);
      await this.assertMemberIsActive(member.status);
      await this.assertOrganizationIsActive(organization.status);
      await this.assertAccountIsNotDormant(account.isDormant);

      // 보호 예외 정책
      if (!this.hasBypassPolicy(bypassPolicies, BYPASS_POLICIES.PASSWORD)) {
        await this.assertPasswordIsNotExpired(account.isPasswordExpired);
      }
      if (!this.hasBypassPolicy(bypassPolicies, BYPASS_POLICIES.TERMS)) {
        await this.assertTermsAreAgreed(terms);
      }

      // 리소스 정책
      await this.assertPermissions(context, permissions);
    }

    return true;
  }

  /**
   * 공개 라우트 여부를 판정한다.
   */
  private checkPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  /**
   * 인증에 필요한 계정, 조직, 약관, 권한 컨텍스트를 한 번에 읽는다.
   */
  private readAccountContext(): {
    account: AuthAccountContext
    member: AuthMemberContext
    organization: AuthOrganizationContext
    terms: AuthTermsSnapshotContext[]
    permissions: string[]
  } {
    const account = this.cls.get<AuthAccountContext>('account');
    const member = this.cls.get<AuthMemberContext>('member');
    const organization = this.cls.get<AuthOrganizationContext>('organization');
    const terms = this.cls.get<AuthTermsSnapshotContext[]>('terms');
    const permissions = this.cls.get<string[]>('permissions');

    if (!account || !member || !organization || !terms || !permissions) {
      throw new UnauthorizedException('Request context is missing');
    }

    return { account, member, organization, terms, permissions };
  }

  /**
   * 계정이 활성 상태인지 확인한다.
   */
  private async assertAccountIsActive(accountStatus: AuthAccountContext['status']) {
    if (accountStatus !== AccountStatus.ACTIVE) {
      await AuthGuardAsserter.throw('INACTIVE_ACCOUNT');
    }
  }

  /**
   * 멤버가 활성 상태인지 확인한다.
   */
  private async assertMemberIsActive(memberStatus: AuthMemberContext['status']) {
    if (memberStatus !== MemberStatus.ACTIVE) {
      await AuthGuardAsserter.throw('INACTIVE_MEMBER');
    }
  }

  /**
   * 조직이 활성 상태인지 확인한다.
   */
  private async assertOrganizationIsActive(organizationStatus: AuthOrganizationContext['status']) {
    if (organizationStatus !== OrganizationStatus.ACTIVE) {
      await AuthGuardAsserter.throw('INACTIVE_ORGANIZATION');
    }
  }

  /**
   * 휴면 계정인지 확인한다.
   */
  private async assertAccountIsNotDormant(isDormant: boolean) {
    if (isDormant) {
      await AuthGuardAsserter.throw('DORMANT_ACCOUNT');
    }
  }

  /**
   * bypass 정책 포함 여부를 확인한다.
   */
  private hasBypassPolicy(bypassPolicies: string[] | undefined, policy: string): boolean {
    return Array.isArray(bypassPolicies) && bypassPolicies.some((value) => value === policy);
  }

  /**
   * 비밀번호 만료 여부를 확인한다.
   */
  private async assertPasswordIsNotExpired(isPasswordExpired: boolean) {
    if (isPasswordExpired) {
      await AuthGuardAsserter.throw('PASSWORD_CHANGE_REQUIRED');
    }
  }

  /**
   * 약관 동의 여부를 확인한다.
   */
  private async assertTermsAreAgreed(terms: AuthTermsSnapshotContext[]) {
    if (terms.some((term) => term.required && !term.agreed)) {
      await AuthGuardAsserter.throw('TERMS_AGREEMENT_REQUIRED');
    }
  }

  /**
   * bypass 정책 목록을 읽는다.
   */
  private readBypassPolicies(context: ExecutionContext): string[] | undefined {
    return this.reflector.getAllAndOverride<string[]>(BYPASS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  /**
   * 명시된 권한이 모두 있는지 확인한다.
   */
  private async assertPermissions(context: ExecutionContext, permissions: string[]) {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
      return;
    }

    const hasPermission = requiredPermissions.every((required) =>
      permissions.some((owned) => owned === required),
    );

    if (!hasPermission) {
      await AuthGuardAsserter.throw('INSUFFICIENT_PERMISSIONS');
    }
  }
}
