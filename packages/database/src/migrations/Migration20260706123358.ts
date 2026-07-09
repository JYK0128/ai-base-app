import { Migration } from '@mikro-orm/migrations';

export class Migration20260706123358 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "platform"."OrganizationRole" add "sortOrder" int null;`);
    this.addSql(`alter table "platform"."OrganizationRole" add constraint "OrganizationRole_organization_code_unique" unique ("organization", "code");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "platform"."OrganizationRole" drop constraint "OrganizationRole_organization_code_unique";`);
    this.addSql(`alter table "platform"."OrganizationRole" drop column "sortOrder";`);
  }
}
