import { Migration } from '@mikro-orm/migrations';

export class Migration20260507090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "platform"."ManagerAccount" add column if not exists "manager" varchar(255) null;');
    this.addSql('alter table "platform"."ManagerAccount" add column if not exists "passwordExpiresAt" timestamptz null;');

    this.addSql(`
      update "platform"."ManagerAccount" account
      set "manager" = manager."id",
          "passwordExpiresAt" = coalesce(account."passwordExpiresAt", account."nextPasswordChangeAt")
      from "platform"."Manager" manager
      where manager."managerAccount" = account."id"
        and account."manager" is null
    `);

    this.addSql(`
      insert into "platform"."Manager" (
        "id",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "deletedBy",
        "status",
        "organization",
        "managerAccount",
        "role"
      )
      select
        account."id",
        account."createdAt",
        account."updatedAt",
        account."deletedAt",
        account."deletedBy",
        'ACTIVE',
        null,
        account."id",
        'PLATFORM_ADMIN'
      from "platform"."ManagerAccount" account
      where account."manager" is null
        and not exists (
          select 1
          from "platform"."Manager" manager
          where manager."id" = account."id"
        )
    `);

    this.addSql(`
      update "platform"."ManagerAccount" account
      set "manager" = account."id"
      where account."manager" is null
    `);

    this.addSql(`
      alter table "platform"."ManagerAccount"
      drop constraint if exists "ManagerAccount_manager_foreign"
    `);
    this.addSql(`
      alter table "platform"."ManagerAccount"
      add constraint "ManagerAccount_manager_foreign"
      foreign key ("manager") references "platform"."Manager" ("id")
    `);
    this.addSql('alter table "platform"."ManagerAccount" alter column "manager" set not null;');

    this.addSql('alter table "platform"."ManagerRole" add column if not exists "manager" varchar(255) null;');
    this.addSql(`
      update "platform"."ManagerRole" manager_role
      set "manager" = manager."id"
      from "platform"."Manager" manager
      where (
          manager."id" = manager_role."managerId"
          or manager."managerAccount" = manager_role."managerId"
        )
        and manager_role."manager" is null
    `);
    this.addSql(`
      delete from "platform"."ManagerRole"
      where "manager" is null
    `);
    this.addSql(`
      alter table "platform"."ManagerRole"
      drop constraint if exists "ManagerRole_manager_foreign"
    `);
    this.addSql(`
      alter table "platform"."ManagerRole"
      add constraint "ManagerRole_manager_foreign"
      foreign key ("manager") references "platform"."Manager" ("id")
    `);
    this.addSql('alter table "platform"."ManagerRole" alter column "manager" set not null;');

    this.addSql('alter table "platform"."Manager" drop constraint if exists "Manager_managerAccount_foreign";');
    this.addSql('drop index if exists "platform"."Manager_managerAccount_index";');
    this.addSql('alter table "platform"."Manager" drop constraint if exists "Manager_managerAccount_organization_role_unique";');
    this.addSql('alter table "platform"."Manager" drop constraint if exists "Manager_role_check";');
    this.addSql('alter table "platform"."Manager" drop column if exists "managerAccount";');
    this.addSql('alter table "platform"."Manager" drop column if exists "role";');

    this.addSql('drop index if exists "platform"."ManagerRole_managerId_index";');
    this.addSql('alter table "platform"."ManagerRole" drop constraint if exists "ManagerRole_managerId_role_organization_unique";');
    this.addSql('alter table "platform"."ManagerRole" drop column if exists "managerId";');
    this.addSql('create index if not exists "ManagerRole_manager_index" on "platform"."ManagerRole" ("manager");');

    this.addSql('alter table "platform"."ManagerAccount" drop constraint if exists "ManagerAccount_status_check";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "loginAttempts";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "passwordChangedAt";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "nextPasswordChangeAt";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "forcePasswordChange";');
    this.addSql(`
      alter table "platform"."ManagerAccount"
      add constraint "ManagerAccount_status_check"
      check ("status" in ('ACTIVE', 'INACTIVE'))
    `);
  }

  override async down(): Promise<void> {
    this.addSql('alter table "platform"."ManagerRole" drop constraint if exists "ManagerRole_manager_foreign";');
    this.addSql('drop index if exists "platform"."ManagerRole_manager_index";');
    this.addSql('alter table "platform"."ManagerRole" drop column if exists "manager";');

    this.addSql('alter table "platform"."ManagerAccount" drop constraint if exists "ManagerAccount_manager_foreign";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "manager";');
    this.addSql('alter table "platform"."ManagerAccount" drop column if exists "passwordExpiresAt";');
  }
}
