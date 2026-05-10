import { Migration } from '@mikro-orm/migrations';

export class Migration20260510090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "platform"."ManagerAccount" drop constraint if exists "ManagerAccount_status_check";');
    this.addSql(`
      alter table "platform"."ManagerAccount"
      add constraint "ManagerAccount_status_check"
      check ("status" in ('PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE'))
    `);

    this.addSql(`
      create table if not exists "platform"."ManagerAccountVerification" (
        "id" varchar(255) not null,
        "createdAt" timestamptz not null,
        "createdBy" varchar(255) null,
        "updatedAt" timestamptz not null,
        "updatedBy" varchar(255) null,
        "deletedAt" timestamptz null,
        "deletedBy" varchar(255) null,
        "metadata" jsonb null,
        "tokenHash" varchar(255) not null,
        "managerAccount" varchar(255) not null,
        "expiresAt" timestamptz not null,
        "verifiedAt" timestamptz null,
        "status" varchar(255) not null,
        constraint "ManagerAccountVerification_pkey" primary key ("id"),
        constraint "ManagerAccountVerification_status_check"
          check ("status" in ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELED'))
      );
    `);
    this.addSql('alter table "platform"."ManagerAccountVerification" add constraint "ManagerAccountVerification_tokenHash_unique" unique ("tokenHash");');
    this.addSql('create index if not exists "ManagerAccountVerification_managerAccount_index" on "platform"."ManagerAccountVerification" ("managerAccount");');
    this.addSql(`
      alter table "platform"."ManagerAccountVerification"
      add constraint "ManagerAccountVerification_managerAccount_foreign"
      foreign key ("managerAccount") references "platform"."ManagerAccount" ("id")
    `);
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "platform"."ManagerAccountVerification" cascade;');
    this.addSql('alter table "platform"."ManagerAccount" drop constraint if exists "ManagerAccount_status_check";');
    this.addSql(`
      alter table "platform"."ManagerAccount"
      add constraint "ManagerAccount_status_check"
      check ("status" in ('ACTIVE', 'INACTIVE'))
    `);
  }
}
