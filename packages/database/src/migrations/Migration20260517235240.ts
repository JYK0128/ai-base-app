import { Migration } from '@mikro-orm/migrations';

export class Migration20260517235240 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "platform"."Resource" ("id" varchar(255) not null, "createdAt" timestamptz not null, "createdBy" varchar(255) null, "updatedAt" timestamptz not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz null, "deletedBy" varchar(255) null, "metadata" jsonb null, "code" varchar(255) not null, "name" varchar(255) not null, "type" text not null, "parent" varchar(255) null, "path" varchar(255) null, "icon" varchar(255) null, "displayOrder" int null, "httpMethod" varchar(255) null, "pathPattern" varchar(255) null, primary key ("id"));`);
    this.addSql(`alter table "platform"."Resource" add constraint "Resource_code_unique" unique ("code");`);

    this.addSql(`create table "platform"."ManagerTermsConsent" ("id" varchar(255) not null, "createdAt" timestamptz not null, "createdBy" varchar(255) null, "updatedAt" timestamptz not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz null, "deletedBy" varchar(255) null, "metadata" jsonb null, "manager" varchar(255) not null, "organization" varchar(255) null, "termsVersion" varchar(255) not null, "agreed" boolean not null, "ipAddress" varchar(255) null, "userAgent" text null, primary key ("id"));`);

    this.addSql(`alter table "platform"."Resource" add constraint "Resource_parent_foreign" foreign key ("parent") references "platform"."Resource" ("id") on delete set null;`);
    this.addSql(`alter table "platform"."Resource" add constraint "Resource_type_check" check ("type" in ('MENU', 'API', 'UI_ELEMENT'));`);

    this.addSql(`alter table "platform"."ManagerTermsConsent" add constraint "ManagerTermsConsent_manager_foreign" foreign key ("manager") references "platform"."Manager" ("id");`);
    this.addSql(`alter table "platform"."ManagerTermsConsent" add constraint "ManagerTermsConsent_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on delete set null;`);
    this.addSql(`alter table "platform"."ManagerTermsConsent" add constraint "ManagerTermsConsent_termsVersion_foreign" foreign key ("termsVersion") references "platform"."TermsVersion" ("id");`);

    this.addSql(`alter table "platform"."TermsVersion" drop constraint "TermsVersion_terms_document_id_foreign";`);

    this.addSql(`drop index "Manager_organization_index";`);

    this.addSql(`drop index "ManagerInvite_invitedBy_index";`);
    this.addSql(`drop index "ManagerInvite_organization_index";`);
    this.addSql(`alter table "platform"."ManagerInvite" drop constraint "ManagerInvite_token_unique";`);

    this.addSql(`alter table "platform"."ManagerAccount" alter column "passwordExpiresAt" set not null;`);

    this.addSql(`drop index "Announcement_author_index";`);

    this.addSql(`alter table "platform"."Permission" add "resource" varchar(255) not null, add "action" varchar(255) not null;`);
    this.addSql(`alter table "platform"."Permission" add constraint "Permission_resource_foreign" foreign key ("resource") references "platform"."Resource" ("id");`);

    this.addSql(`drop index "Role_scope_index";`);

    this.addSql(`drop index "ManagerRole_manager_index";`);
    this.addSql(`drop index "ManagerRole_organization_index";`);
    this.addSql(`drop index "ManagerRole_role_index";`);

    this.addSql(`alter table "platform"."RolePermission" drop constraint "RolePermission_role_permission_unique";`);

    this.addSql(`drop index "SupportTicket_assignedTo_index";`);
    this.addSql(`drop index "SupportTicket_author_index";`);
    this.addSql(`drop index "SupportTicket_organization_index";`);

    this.addSql(`drop index "TermsDocument_group_type_code_index";`);
    this.addSql(`drop index "TermsDocument_organization_group_type_code_index";`);
    this.addSql(`alter table "platform"."TermsDocument" drop constraint "TermsDocument_group_type_check";`);
    this.addSql(`alter table "platform"."TermsDocument" drop constraint "TermsDocument_scope_check";`);
    this.addSql(`alter table "platform"."TermsDocument" add "createdAt" timestamptz not null, add "createdBy" varchar(255) null, add "updatedAt" timestamptz not null, add "updatedBy" varchar(255) null, add "deletedAt" timestamptz null, add "deletedBy" varchar(255) null, add "organization" varchar(255) null, add "latestVersion" varchar(255) null;`);
    this.addSql(`alter table "platform"."TermsDocument" add constraint "TermsDocument_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on delete set null;`);
    this.addSql(`alter table "platform"."TermsDocument" add constraint "TermsDocument_latestVersion_foreign" foreign key ("latestVersion") references "platform"."TermsVersion" ("id") on delete set null;`);
    this.addSql(`alter table "platform"."TermsDocument" add constraint "TermsDocument_code_unique" unique ("code");`);

    this.addSql(`drop index "TermsVersion_terms_document_id_index";`);
    this.addSql(`alter table "platform"."TermsVersion" drop constraint "TermsVersion_terms_document_id_version_label_unique";`);
    this.addSql(`alter table "platform"."TermsVersion" add "createdAt" timestamptz not null, add "createdBy" varchar(255) null, add "updatedAt" timestamptz not null, add "updatedBy" varchar(255) null, add "deletedAt" timestamptz null, add "deletedBy" varchar(255) null, add "checksum" varchar(255) not null, add "effectiveFrom" timestamptz not null, add "effectiveTo" timestamptz not null;`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "terms_document_id" to "termsDocument";`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "version_label" to "label";`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "content_md" to "content";`);
    this.addSql(`alter table "platform"."TermsVersion" add constraint "TermsVersion_termsDocument_foreign" foreign key ("termsDocument") references "platform"."TermsDocument" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create schema if not exists "application";`);
    this.addSql(`create schema if not exists "audit";`);
    this.addSql(`create schema if not exists "billing";`);
    this.addSql(`create schema if not exists "site";`);
    this.addSql(`create table "application"."Application" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "providerOrganization" varchar(255) not null, "code" varchar(255) not null, "name" varchar(255) not null, "description" text null, "status" text not null default 'DRAFT', primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX "Application_providerOrganization_code_unique" ON application."Application" USING btree ("providerOrganization", code);`);
    this.addSql(`CREATE INDEX "Application_providerOrganization_index" ON application."Application" USING btree ("providerOrganization");`);

    this.addSql(`create table "application"."ApplicationMembership" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "subscription" varchar(255) not null, "user" varchar(255) not null, "release" varchar(255) null, "status" text not null default 'ACTIVE', "joinedAt" timestamptz(6) not null, "leftAt" timestamptz(6) null, primary key ("id"));`);
    this.addSql(`create index "ApplicationMembership_release_index" on "application"."ApplicationMembership" ("release");`);
    this.addSql(`create index "ApplicationMembership_subscription_index" on "application"."ApplicationMembership" ("subscription");`);
    this.addSql(`CREATE UNIQUE INDEX "ApplicationMembership_subscription_user_unique" ON application."ApplicationMembership" USING btree (subscription, "user");`);
    this.addSql(`CREATE INDEX "ApplicationMembership_user_index" ON application."ApplicationMembership" USING btree ("user");`);

    this.addSql(`create table "application"."ApplicationPlan" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "application" varchar(255) not null, "code" varchar(255) not null, "name" varchar(255) not null, "billingCycle" varchar(255) not null default 'MONTHLY', "unitPrice" numeric(14,2) not null, "currency" varchar(3) not null default 'USD', primary key ("id"));`);
    this.addSql(`alter table "application"."ApplicationPlan" add constraint "ApplicationPlan_application_code_unique" unique ("application", "code");`);
    this.addSql(`create index "ApplicationPlan_application_index" on "application"."ApplicationPlan" ("application");`);

    this.addSql(`create table "application"."ApplicationRelease" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "application" varchar(255) not null, "version" varchar(255) not null, "releaseNote" text null, "isStable" bool not null default false, primary key ("id"));`);
    this.addSql(`create index "ApplicationRelease_application_index" on "application"."ApplicationRelease" ("application");`);
    this.addSql(`alter table "application"."ApplicationRelease" add constraint "ApplicationRelease_application_version_unique" unique ("application", "version");`);

    this.addSql(`create table "application"."ApplicationSubscription" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "customerOrganization" varchar(255) not null, "application" varchar(255) not null, "plan" varchar(255) not null, "status" text not null default 'ACTIVE', "startedAt" timestamptz(6) not null, "endedAt" timestamptz(6) null, primary key ("id"));`);
    this.addSql(`create index "ApplicationSubscription_application_index" on "application"."ApplicationSubscription" ("application");`);
    this.addSql(`CREATE UNIQUE INDEX "ApplicationSubscription_customerOrganization_application_unique" ON application."ApplicationSubscription" USING btree ("customerOrganization", application);`);
    this.addSql(`CREATE INDEX "ApplicationSubscription_customerOrganization_index" ON application."ApplicationSubscription" USING btree ("customerOrganization");`);
    this.addSql(`create index "ApplicationSubscription_plan_index" on "application"."ApplicationSubscription" ("plan");`);

    this.addSql(`create table "audit"."Audit" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "eventType" text not null, "aggregateType" varchar(255) not null, "aggregateId" varchar(255) not null, "organization" varchar(255) null, "actorManagerId" varchar(255) null, "actorUserId" varchar(255) null, "occurredAt" timestamptz(6) not null, primary key ("id"));`);
    this.addSql(`CREATE INDEX "Audit_aggregateId_index" ON audit."Audit" USING btree ("aggregateId");`);
    this.addSql(`CREATE INDEX "Audit_eventType_index" ON audit."Audit" USING btree ("eventType");`);
    this.addSql(`create index "Audit_organization_index" on "audit"."Audit" ("organization");`);

    this.addSql(`create table "billing"."BillingOrder" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "organization" varchar(255) not null, "subscription" varchar(255) not null, "billingProfile" varchar(255) not null, "billingName" varchar(255) not null, "taxId" varchar(255) null, "billingAddress" text not null, "currency" varchar(3) not null default 'USD', "taxAmount" numeric(14,2) not null default 0.00, "totalAmount" numeric(14,2) not null default 0.00, "providerTransactionId" varchar(255) null, "idempotencyKey" varchar(255) null, "status" text not null default 'PENDING', primary key ("id"));`);
    this.addSql(`CREATE INDEX "BillingOrder_billingProfile_index" ON billing."BillingOrder" USING btree ("billingProfile");`);
    this.addSql(`CREATE UNIQUE INDEX "BillingOrder_idempotencyKey_unique" ON billing."BillingOrder" USING btree ("idempotencyKey");`);
    this.addSql(`create index "BillingOrder_organization_index" on "billing"."BillingOrder" ("organization");`);
    this.addSql(`create index "BillingOrder_subscription_index" on "billing"."BillingOrder" ("subscription");`);

    this.addSql(`create table "billing"."BillingPayment" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "order" varchar(255) not null, "amount" numeric(14,2) not null, "currency" varchar(3) not null default 'USD', "providerTransactionId" varchar(255) null, "idempotencyKey" varchar(255) not null, "status" text not null default 'PENDING', "paidAt" timestamptz(6) null, primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX "BillingPayment_idempotencyKey_unique" ON billing."BillingPayment" USING btree ("idempotencyKey");`);
    this.addSql(`CREATE INDEX "BillingPayment_order_index" ON billing."BillingPayment" USING btree ("order");`);

    this.addSql(`create table "billing"."BillingProfile" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "organization" varchar(255) not null, "billingName" varchar(255) not null, "taxId" varchar(255) null, "billingAddress" text not null, "currency" varchar(3) not null default 'USD', "billingEmail" varchar(255) null, primary key ("id"));`);
    this.addSql(`create index "BillingProfile_organization_index" on "billing"."BillingProfile" ("organization");`);
    this.addSql(`alter table "billing"."BillingProfile" add constraint "BillingProfile_organization_unique" unique ("organization");`);

    this.addSql(`create table "platform"."Message" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "locale" varchar(255) not null, "namespace" varchar(255) not null, "key" varchar(255) not null, "message" text not null, primary key ("id"));`);
    this.addSql(`alter table "platform"."Message" add constraint "Message_locale_namespace_key_unique" unique ("locale", "namespace", "key");`);

    this.addSql(`create table "site"."Site" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "organization" varchar(255) not null, "code" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "isActive" bool not null default true, primary key ("id"));`);
    this.addSql(`alter table "site"."Site" add constraint "Site_organization_code_unique" unique ("organization", "code");`);
    this.addSql(`create index "Site_organization_index" on "site"."Site" ("organization");`);

    this.addSql(`create table "site"."User" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "site" varchar(255) not null, "userAccount" varchar(255) not null, "role" varchar(255) not null default 'EndUser', primary key ("id"));`);
    this.addSql(`create index "User_site_index" on "site"."User" ("site");`);
    this.addSql(`CREATE UNIQUE INDEX "User_site_userAccount_unique" ON site."User" USING btree (site, "userAccount");`);
    this.addSql(`CREATE INDEX "User_userAccount_index" ON site."User" USING btree ("userAccount");`);

    this.addSql(`create table "site"."UserAccount" ("id" varchar(255) not null, "createdAt" timestamptz(6) not null, "createdBy" varchar(255) null, "updatedAt" timestamptz(6) not null, "updatedBy" varchar(255) null, "deletedAt" timestamptz(6) null, "deletedBy" varchar(255) null, "metadata" jsonb null, "site" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, primary key ("id"));`);
    this.addSql(`alter table "site"."UserAccount" add constraint "UserAccount_site_email_unique" unique ("site", "email");`);
    this.addSql(`create index "UserAccount_site_index" on "site"."UserAccount" ("site");`);

    this.addSql(`create table "platform"."UserTermsConsent" ("id" varchar(255) not null, "created_at" timestamptz(6) not null, "created_by" varchar(255) null, "updated_at" timestamptz(6) not null, "updated_by" varchar(255) null, "deleted_at" timestamptz(6) null, "deleted_by" varchar(255) null, "metadata" jsonb null, "user_id" varchar(255) not null, "organization_id" varchar(255) null, "terms_version_id" varchar(255) not null, "agreed" bool not null default true, "agreed_at" timestamptz(6) not null, "source" varchar(255) null, "ip_address" varchar(255) null, "user_agent" text null, primary key ("id"));`);
    this.addSql(`create index "UserTermsConsent_organization_id_index" on "platform"."UserTermsConsent" ("organization_id");`);
    this.addSql(`create index "UserTermsConsent_terms_version_id_index" on "platform"."UserTermsConsent" ("terms_version_id");`);
    this.addSql(`create index "UserTermsConsent_user_id_index" on "platform"."UserTermsConsent" ("user_id");`);
    this.addSql(`alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_user_id_organization_id_terms_version_id_uniqu" unique ("user_id", "organization_id", "terms_version_id");`);

    this.addSql(`alter table "application"."Application" add constraint "Application_providerOrganization_foreign" foreign key ("providerOrganization") references "platform"."Organization" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."Application" add constraint "Application_status_check" check ("status" in ('DRAFT', 'ACTIVE', 'SUSPENDED'));`);

    this.addSql(`alter table "application"."ApplicationMembership" add constraint "ApplicationMembership_release_foreign" foreign key ("release") references "application"."ApplicationRelease" ("id") on update no action on delete set null;`);
    this.addSql(`alter table "application"."ApplicationMembership" add constraint "ApplicationMembership_subscription_foreign" foreign key ("subscription") references "application"."ApplicationSubscription" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."ApplicationMembership" add constraint "ApplicationMembership_user_foreign" foreign key ("user") references "site"."User" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."ApplicationMembership" add constraint "ApplicationMembership_status_check" check ("status" in ('ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'TERMINATED'));`);

    this.addSql(`alter table "application"."ApplicationPlan" add constraint "ApplicationPlan_application_foreign" foreign key ("application") references "application"."Application" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "application"."ApplicationRelease" add constraint "ApplicationRelease_application_foreign" foreign key ("application") references "application"."Application" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "application"."ApplicationSubscription" add constraint "ApplicationSubscription_application_foreign" foreign key ("application") references "application"."Application" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."ApplicationSubscription" add constraint "ApplicationSubscription_customerOrganization_foreign" foreign key ("customerOrganization") references "platform"."Organization" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."ApplicationSubscription" add constraint "ApplicationSubscription_plan_foreign" foreign key ("plan") references "application"."ApplicationPlan" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "application"."ApplicationSubscription" add constraint "ApplicationSubscription_status_check" check ("status" in ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED'));`);

    this.addSql(`alter table "audit"."Audit" add constraint "Audit_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on update no action on delete set null;`);
    this.addSql(`alter table "audit"."Audit" add constraint "Audit_eventType_check" check ("eventType" in ('MANAGER_ROLE_ASSIGNED', 'MANAGER_ROLE_REVOKED', 'SUBSCRIPTION_STATUS_CHANGED', 'USER_APPLICATION_JOINED', 'USER_APPLICATION_WITHDRAWN'));`);

    this.addSql(`alter table "billing"."BillingOrder" add constraint "BillingOrder_billingProfile_foreign" foreign key ("billingProfile") references "billing"."BillingProfile" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "billing"."BillingOrder" add constraint "BillingOrder_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "billing"."BillingOrder" add constraint "BillingOrder_subscription_foreign" foreign key ("subscription") references "application"."ApplicationSubscription" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "billing"."BillingOrder" add constraint "BillingOrder_status_check" check ("status" in ('PENDING', 'CONFIRMED', 'CANCELED', 'FAILED'));`);

    this.addSql(`alter table "billing"."BillingPayment" add constraint "BillingPayment_order_foreign" foreign key ("order") references "billing"."BillingOrder" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "billing"."BillingPayment" add constraint "BillingPayment_status_check" check ("status" in ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'));`);

    this.addSql(`alter table "billing"."BillingProfile" add constraint "BillingProfile_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "site"."Site" add constraint "Site_organization_foreign" foreign key ("organization") references "platform"."Organization" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "site"."User" add constraint "User_site_foreign" foreign key ("site") references "site"."Site" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "site"."User" add constraint "User_userAccount_foreign" foreign key ("userAccount") references "site"."UserAccount" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "site"."UserAccount" add constraint "UserAccount_site_foreign" foreign key ("site") references "site"."Site" ("id") on update no action on delete no action;`);

    this.addSql(`alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_organization_id_foreign" foreign key ("organization_id") references "platform"."Organization" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_terms_version_id_foreign" foreign key ("terms_version_id") references "platform"."TermsVersion" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "platform"."UserTermsConsent" add constraint "UserTermsConsent_user_id_foreign" foreign key ("user_id") references "site"."User" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "platform"."TermsDocument" drop constraint "TermsDocument_organization_foreign";`);
    this.addSql(`alter table "platform"."TermsDocument" drop constraint "TermsDocument_latestVersion_foreign";`);

    this.addSql(`alter table "platform"."TermsVersion" drop constraint "TermsVersion_termsDocument_foreign";`);

    this.addSql(`create index "Announcement_author_index" on "platform"."Announcement" ("author");`);

    this.addSql(`create index "Manager_organization_index" on "platform"."Manager" ("organization");`);

    this.addSql(`alter table "platform"."ManagerAccount" alter column "passwordExpiresAt" drop not null;`);

    this.addSql(`CREATE INDEX "ManagerInvite_invitedBy_index" ON platform."ManagerInvite" USING btree ("invitedBy");`);
    this.addSql(`create index "ManagerInvite_organization_index" on "platform"."ManagerInvite" ("organization");`);
    this.addSql(`alter table "platform"."ManagerInvite" add constraint "ManagerInvite_token_unique" unique ("token");`);

    this.addSql(`create index "ManagerRole_manager_index" on "platform"."ManagerRole" ("manager");`);
    this.addSql(`create index "ManagerRole_organization_index" on "platform"."ManagerRole" ("organization");`);
    this.addSql(`create index "ManagerRole_role_index" on "platform"."ManagerRole" ("role");`);

    this.addSql(`create index "Role_scope_index" on "platform"."Role" ("scope");`);

    this.addSql(`alter table "platform"."RolePermission" add constraint "RolePermission_role_permission_unique" unique ("role", "permission");`);

    this.addSql(`CREATE INDEX "SupportTicket_assignedTo_index" ON platform."SupportTicket" USING btree ("assignedTo");`);
    this.addSql(`create index "SupportTicket_author_index" on "platform"."SupportTicket" ("author");`);
    this.addSql(`create index "SupportTicket_organization_index" on "platform"."SupportTicket" ("organization");`);

    this.addSql(`alter table "platform"."TermsDocument" drop constraint "TermsDocument_code_unique";`);
    this.addSql(`alter table "platform"."TermsDocument" add "created_at" timestamptz(6) not null, add "created_by" varchar(255) null, add "updated_at" timestamptz(6) not null, add "updated_by" varchar(255) null, add "deleted_by" varchar(255) null, add "group_type" text not null, add "organization_id" varchar(255) null, add "latest_version_id" varchar(255) null, add "deprecated_at" timestamptz(6) null;`);
    this.addSql(`alter table "platform"."TermsDocument" alter column "required" set default true;`);
    this.addSql(`alter table "platform"."TermsDocument" rename column "deletedAt" to "deleted_at";`);
    this.addSql(`create index "TermsDocument_group_type_code_index" on "platform"."TermsDocument" ("group_type", "code");`);
    this.addSql(`create index "TermsDocument_organization_group_type_code_index" on "platform"."TermsDocument" ("organization_id", "group_type", "code");`);
    this.addSql(`alter table "platform"."TermsDocument" add constraint "TermsDocument_group_type_check" check ("group_type" in ('PLATFORM', 'ORGANIZATION'));`);
    this.addSql(`alter table "platform"."TermsDocument" add constraint "TermsDocument_scope_check" check (((group_type = 'PLATFORM'::text) AND (organization_id IS NULL)) OR ((group_type = 'ORGANIZATION'::text) AND (organization_id IS NOT NULL)));`);

    this.addSql(`alter table "platform"."TermsVersion" add "created_at" timestamptz(6) not null, add "created_by" varchar(255) null, add "updated_at" timestamptz(6) not null, add "updated_by" varchar(255) null, add "deleted_by" varchar(255) null, add "content_html" text null, add "checksum_sha256" varchar(255) null, add "effective_from" timestamptz(6) null, add "effective_to" timestamptz(6) null, add "published_at" timestamptz(6) null, add "published_by" varchar(255) null;`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "deletedAt" to "deleted_at";`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "termsDocument" to "terms_document_id";`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "label" to "version_label";`);
    this.addSql(`alter table "platform"."TermsVersion" rename column "content" to "content_md";`);
    this.addSql(`alter table "platform"."TermsVersion" add constraint "TermsVersion_terms_document_id_foreign" foreign key ("terms_document_id") references "platform"."TermsDocument" ("id") on update cascade on delete no action;`);
    this.addSql(`create index "TermsVersion_terms_document_id_index" on "platform"."TermsVersion" ("terms_document_id");`);
    this.addSql(`alter table "platform"."TermsVersion" add constraint "TermsVersion_terms_document_id_version_label_unique" unique ("terms_document_id", "version_label");`);
  }

}
