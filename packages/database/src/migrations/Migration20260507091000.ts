import { Migration } from '@mikro-orm/migrations';

export class Migration20260507091000 extends Migration {
  override async up(): Promise<void> {
    const tables = [
      ['application', 'Application'],
      ['application', 'ApplicationMembership'],
      ['application', 'ApplicationPlan'],
      ['application', 'ApplicationRelease'],
      ['application', 'ApplicationSubscription'],
      ['billing', 'BillingOrder'],
      ['billing', 'BillingPayment'],
      ['billing', 'BillingProfile'],
      ['platform', 'Manager'],
      ['platform', 'ManagerAccount'],
      ['platform', 'ManagerInvite'],
      ['platform', 'ManagerRole'],
      ['platform', 'Message'],
      ['platform', 'Organization'],
      ['platform', 'Permission'],
      ['platform', 'Role'],
      ['platform', 'RolePermission'],
      ['site', 'Site'],
      ['site', 'User'],
      ['site', 'UserAccount'],
    ] as const;

    for (const [schema, table] of tables) {
      this.addSql(`alter table "${schema}"."${table}" add column if not exists "metadata" jsonb null;`);
    }
  }

  override async down(): Promise<void> {
    const tables = [
      ['application', 'Application'],
      ['application', 'ApplicationMembership'],
      ['application', 'ApplicationPlan'],
      ['application', 'ApplicationRelease'],
      ['application', 'ApplicationSubscription'],
      ['billing', 'BillingOrder'],
      ['billing', 'BillingPayment'],
      ['billing', 'BillingProfile'],
      ['platform', 'Manager'],
      ['platform', 'ManagerAccount'],
      ['platform', 'ManagerInvite'],
      ['platform', 'ManagerRole'],
      ['platform', 'Message'],
      ['platform', 'Organization'],
      ['platform', 'Permission'],
      ['platform', 'Role'],
      ['platform', 'RolePermission'],
      ['site', 'Site'],
      ['site', 'User'],
      ['site', 'UserAccount'],
    ] as const;

    for (const [schema, table] of tables) {
      this.addSql(`alter table "${schema}"."${table}" drop column if exists "metadata";`);
    }
  }
}
