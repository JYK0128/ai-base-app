import { Migration } from '@mikro-orm/migrations';

export class Migration20260511110000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('create table "platform"."TermsDocument" ("id" varchar(255) not null, "created_at" timestamptz not null, "created_by" varchar(255) null, "updated_at" timestamptz not null, "updated_by" varchar(255) null, "deleted_at" timestamptz null, "deleted_by" varchar(255) null, "metadata" jsonb null, "group_type" text check ("group_type" in (\'PLATFORM\', \'ORGANIZATION\')) not null, "code" varchar(255) not null, "title" varchar(255) not null, "required" boolean not null default true, "status" text check ("status" in (\'DRAFT\', \'PUBLISHED\', \'DEPRECATED\')) not null default \'DRAFT\', "organization_id" varchar(255) null, "latest_version_id" varchar(255) null, "deprecated_at" timestamptz null, constraint "TermsDocument_pkey" primary key ("id"));');
    this.addSql('alter table "platform"."TermsDocument" add constraint "TermsDocument_scope_check" check ((("group_type" = \'PLATFORM\' and "organization_id" is null) or ("group_type" = \'ORGANIZATION\' and "organization_id" is not null)));');
    this.addSql('create index "TermsDocument_group_type_code_index" on "platform"."TermsDocument" ("group_type", "code");');
    this.addSql('create index "TermsDocument_organization_group_type_code_index" on "platform"."TermsDocument" ("organization_id", "group_type", "code");');

    this.addSql('create table "platform"."TermsVersion" ("id" varchar(255) not null, "created_at" timestamptz not null, "created_by" varchar(255) null, "updated_at" timestamptz not null, "updated_by" varchar(255) null, "deleted_at" timestamptz null, "deleted_by" varchar(255) null, "metadata" jsonb null, "terms_document_id" varchar(255) not null, "version_label" varchar(255) not null, "content_md" text not null, "content_html" text null, "checksum_sha256" varchar(255) null, "status" text check ("status" in (\'DRAFT\', \'PUBLISHED\', \'ARCHIVED\')) not null default \'DRAFT\', "effective_from" timestamptz null, "effective_to" timestamptz null, "published_at" timestamptz null, "published_by" varchar(255) null, constraint "TermsVersion_pkey" primary key ("id"));');
    this.addSql('create index "TermsVersion_terms_document_id_index" on "platform"."TermsVersion" ("terms_document_id");');
    this.addSql('alter table "platform"."TermsVersion" add constraint "TermsVersion_terms_document_id_foreign" foreign key ("terms_document_id") references "platform"."TermsDocument" ("id") on update cascade;');
    this.addSql('alter table "platform"."TermsVersion" add constraint "TermsVersion_terms_document_id_version_label_unique" unique ("terms_document_id", "version_label");');

    this.addSql('create table "platform"."UserTermsConsent" ("id" varchar(255) not null, "created_at" timestamptz not null, "created_by" varchar(255) null, "updated_at" timestamptz not null, "updated_by" varchar(255) null, "deleted_at" timestamptz null, "deleted_by" varchar(255) null, "metadata" jsonb null, "user_id" varchar(255) not null, "organization_id" varchar(255) null, "terms_version_id" varchar(255) not null, "agreed" boolean not null default true, "agreed_at" timestamptz not null, "source" varchar(255) null, "ip_address" varchar(255) null, "user_agent" text null, constraint "UserTermsConsent_pkey" primary key ("id"));');
    this.addSql('create index "UserTermsConsent_user_id_index" on "platform"."UserTermsConsent" ("user_id");');
    this.addSql('create index "UserTermsConsent_organization_id_index" on "platform"."UserTermsConsent" ("organization_id");');
    this.addSql('create index "UserTermsConsent_terms_version_id_index" on "platform"."UserTermsConsent" ("terms_version_id");');
    this.addSql('alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_user_id_foreign" foreign key ("user_id") references "site"."User" ("id") on update cascade;');
    this.addSql('alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_organization_id_foreign" foreign key ("organization_id") references "platform"."Organization" ("id") on update cascade on delete set null;');
    this.addSql('alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_terms_version_id_foreign" foreign key ("terms_version_id") references "platform"."TermsVersion" ("id") on update cascade;');
    this.addSql('alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_user_id_organization_id_terms_version_id_unique" unique ("user_id", "organization_id", "terms_version_id");');
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "platform"."UserTermsConsent" cascade;');
    this.addSql('drop table if exists "platform"."TermsVersion" cascade;');
    this.addSql('drop table if exists "platform"."TermsDocument" cascade;');
  }
}
