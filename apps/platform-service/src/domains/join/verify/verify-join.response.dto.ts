import { ApiProperty } from '@nestjs/swagger';
import { MemberInvite, MemberInviteStatus, TermsDocumentScope } from '@pkg/database';

import { PayloadResponseDto } from '@/common/interfaces';

import type { JoinRequiredTerm } from '../join-terms.helper';
export class VerifyJoinTermItem {
  constructor(term: JoinRequiredTerm) {
    this.documentId = term.documentId;
    this.versionId = term.versionId;
    this.organizationId = term.organizationId;
    this.scope = term.organizationId ? TermsDocumentScope.ORGANIZATION : TermsDocumentScope.PLATFORM;
    this.required = term.required;
    this.title = term.title;
    this.version = term.version;
    this.content = term.content;
  }

  @ApiProperty({ type: String, description: '약관 문서 식별자' })
  documentId!: string;

  @ApiProperty({ type: String, description: '약관 버전 식별자' })
  versionId!: string;

  @ApiProperty({ type: String, nullable: true, description: '조직 식별자' })
  organizationId!: string | null;

  @ApiProperty({ enum: TermsDocumentScope, description: '약관 적용 범위' })
  scope!: TermsDocumentScope;

  @ApiProperty({ type: Boolean, description: '필수 동의 여부' })
  required!: boolean;

  @ApiProperty({ type: String, description: '약관 제목' })
  title!: string;

  @ApiProperty({ type: String, description: '약관 버전 태그' })
  version!: string;

  @ApiProperty({ type: String, description: '약관 내용' })
  content!: string;
}
export class VerifyJoinResponseDto extends PayloadResponseDto {
  constructor(invite: MemberInvite, terms: JoinRequiredTerm[]) {
    super();
    this.inviteId = invite.id;
    this.email = invite.email;
    this.name = invite.name;
    this.organizationId = invite.organization.id;
    this.organizationName = invite.organization.name;
    this.roleId = invite.role.id;
    this.roleName = invite.role.name;
    this.status = invite.status;
    this.expiredAt = invite.metadata.expiredAt ?? null;
    this.terms = terms.map((term) => new VerifyJoinTermItem(term));
  }

  @ApiProperty({ type: String, description: '초대 식별자' })
  inviteId!: string;

  @ApiProperty({ type: String, description: '초대 이메일' })
  email!: string;

  @ApiProperty({ type: String, description: '초대 대상 이름' })
  name!: string;

  @ApiProperty({ type: String, description: '조직 식별자' })
  organizationId!: string;

  @ApiProperty({ type: String, description: '조직 이름' })
  organizationName!: string;

  @ApiProperty({ type: String, description: '역할 식별자' })
  roleId!: string;

  @ApiProperty({ type: String, description: '역할 이름' })
  roleName!: string;

  @ApiProperty({ enum: MemberInviteStatus, description: '초대 상태' })
  status!: MemberInviteStatus;

  @ApiProperty({ type: String, nullable: true, description: '초대 만료 시각' })
  expiredAt!: Date | null;

  @ApiProperty({ type: [VerifyJoinTermItem], description: '가입 시 동의해야 하는 약관 목록' })
  terms!: VerifyJoinTermItem[];
}
