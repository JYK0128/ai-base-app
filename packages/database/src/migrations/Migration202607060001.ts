import { Migration } from '@mikro-orm/migrations';

export class Migration202607060001 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "platform"."Resource" add constraint "Resource_code_unique" unique ("code");');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "platform"."Resource" drop constraint "Resource_code_unique";');
  }
}
